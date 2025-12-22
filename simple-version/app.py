# -*- coding: utf-8 -*-
"""
Sistema de Rifa Altruista - Versión Simple
Servidor Flask para manejo de la aplicación
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_from_directory, send_file
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from functools import wraps
import sqlite3
import os
import hashlib
import random
import string
import requests
import io
import zipfile

app = Flask(__name__)
app.secret_key = 'tu-clave-secreta-super-secreta-cambiala'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['TICKETS_FOLDER'] = 'tickets_pdf'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

# API de generación de tickets
TICKETS_API_BASE = 'https://tickets-fqbvdgbeewbedkfs.centralus-01.azurewebsites.net'

# Asegurar que existan las carpetas
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['TICKETS_FOLDER'], exist_ok=True)

# Configuración de la rifa
RAFFLE_CONFIG = {
    'nombre': 'Rifa Altruista 2025',
    'causa': 'Apoyo a familia damnificada por incendio',
    'premio': 'PlayStation 5',
    'precio_boleto': 50,
    'total_boletos': 500,
    'fecha_sorteo': '2026-01-06 20:00:00',
    'link_noticia': 'https://x.com/telediario/status/1985533370336702812?s=12'
}

# ============= BASE DE DATOS =============

def get_db():
    """Conexión a la base de datos SQLite"""
    db = sqlite3.connect('rifa.db')
    db.row_factory = sqlite3.Row
    return db

def init_db():
    """Inicializar la base de datos"""
    db = get_db()
    
    # Crear tablas
    db.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT,
            password_hash TEXT NOT NULL,
            rol TEXT DEFAULT 'USER',
            email_verificado INTEGER DEFAULT 0,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    db.execute('''
        CREATE TABLE IF NOT EXISTS boletos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero INTEGER UNIQUE NOT NULL,
            estado TEXT DEFAULT 'disponible',
            usuario_id INTEGER,
            compra_id INTEGER,
            reservado_hasta TIMESTAMP,
            nota TEXT,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (compra_id) REFERENCES compras(id)
        )
    ''')
    
    db.execute('''
        CREATE TABLE IF NOT EXISTS compras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            metodo TEXT NOT NULL,
            codigo_unico TEXT UNIQUE NOT NULL,
            vendedor_nombre TEXT,
            comprador_nombre TEXT,
            fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    ''')
    
    db.execute('''
        CREATE TABLE IF NOT EXISTS transferencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            compra_id INTEGER UNIQUE NOT NULL,
            folio TEXT UNIQUE NOT NULL,
            monto REAL NOT NULL,
            fecha_transferencia TIMESTAMP NOT NULL,
            comprobante_url TEXT NOT NULL,
            comprobante_hash TEXT UNIQUE NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            notas_admin TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (compra_id) REFERENCES compras(id)
        )
    ''')
    
    # Migración: agregar columnas vendedor_nombre y comprador_nombre si no existen
    try:
        cursor = db.execute("PRAGMA table_info(compras)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'vendedor_nombre' not in columns:
            db.execute('ALTER TABLE compras ADD COLUMN vendedor_nombre TEXT')
            db.commit()
        if 'comprador_nombre' not in columns:
            db.execute('ALTER TABLE compras ADD COLUMN comprador_nombre TEXT')
            db.commit()
        if 'telefono_comprador' not in columns:
            db.execute('ALTER TABLE compras ADD COLUMN telefono_comprador TEXT')
            db.commit()
    except Exception as e:
        print(f'Nota: Error al agregar columnas (puede que ya existan): {e}')
    
    # Migración: agregar columnas pdf_generado y pdf_filename si no existen
    try:
        cursor = db.execute("PRAGMA table_info(boletos)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'pdf_generado' not in columns:
            db.execute('ALTER TABLE boletos ADD COLUMN pdf_generado INTEGER DEFAULT 0')
            db.commit()
        if 'pdf_filename' not in columns:
            db.execute('ALTER TABLE boletos ADD COLUMN pdf_filename TEXT')
            db.commit()
    except Exception as e:
        print(f'Nota: Error al agregar columnas a boletos (puede que ya existan): {e}')
    
    # Crear boletos del 1 al 500 si no existen
    cursor = db.execute('SELECT COUNT(*) as count FROM boletos')
    if cursor.fetchone()['count'] == 0:
        for i in range(1, RAFFLE_CONFIG['total_boletos'] + 1):
            db.execute('INSERT INTO boletos (numero, estado) VALUES (?, ?)', (i, 'disponible'))
    
    # Crear usuario admin por defecto si no existe
    cursor = db.execute('SELECT COUNT(*) as count FROM usuarios WHERE rol = ?', ('ADMIN',))
    if cursor.fetchone()['count'] == 0:
        admin_password = generate_password_hash('admin123')
        db.execute('''
            INSERT INTO usuarios (nombre, email, password_hash, rol, email_verificado) 
            VALUES (?, ?, ?, ?, ?)
        ''', ('Administrador', 'admin@rifa.com', admin_password, 'ADMIN', 1))
    
    db.commit()
    db.close()

# ============= DECORADORES =============

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('rol') != 'ADMIN':
            return jsonify({'error': 'Acceso denegado'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ============= UTILIDADES =============

def generar_codigo_unico():
    """Genera un código único para la compra"""
    return 'RIFA-' + ''.join(random.choices(string.digits, k=6))

def calcular_hash_archivo(file_path):
    """Calcula el hash SHA256 de un archivo"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

# ============= RUTAS PÚBLICAS =============

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html', config=RAFFLE_CONFIG)

@app.route('/login')
def login():
    """Página de inicio de sesión"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/register')
def register():
    """Página de registro"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('register.html')

# ============= API AUTENTICACIÓN =============

@app.route('/api/register', methods=['POST'])
def api_register():
    """Registrar nuevo usuario"""
    data = request.json
    
    nombre = data.get('nombre', '').strip()
    email = data.get('email', '').strip().lower()
    telefono = data.get('telefono', '').strip()
    password = data.get('password', '')
    
    if not nombre or not email or not password or not telefono:
        return jsonify({'error': 'Todos los campos son requeridos'}), 400
    
    if len(telefono) < 10:
        return jsonify({'error': 'El teléfono debe tener al menos 10 dígitos'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
    
    db = get_db()
    
    # Verificar si el email ya existe
    existing = db.execute('SELECT id FROM usuarios WHERE email = ?', (email,)).fetchone()
    if existing:
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    # Crear usuario
    password_hash = generate_password_hash(password)
    db.execute('''
        INSERT INTO usuarios (nombre, email, telefono, password_hash, email_verificado) 
        VALUES (?, ?, ?, ?, ?)
    ''', (nombre, email, telefono, password_hash, 1))  # email_verificado=1 para simplificar
    
    db.commit()
    user_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    db.close()
    
    # Iniciar sesión automáticamente
    session['user_id'] = user_id
    session['nombre'] = nombre
    session['email'] = email
    session['rol'] = 'USER'
    
    return jsonify({'success': True, 'message': 'Usuario registrado correctamente', 'user_id': user_id})

@app.route('/api/login', methods=['POST'])
def api_login():
    """Iniciar sesión"""
    data = request.json
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email y contraseña son requeridos'}), 400
    
    db = get_db()
    user = db.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()
    db.close()
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Email o contraseña incorrectos'}), 401
    
    # Crear sesión
    session['user_id'] = user['id']
    session['nombre'] = user['nombre']
    session['email'] = user['email']
    session['rol'] = user['rol']
    
    return jsonify({
        'success': True,
        'message': 'Inicio de sesión exitoso',
        'rol': user['rol']
    })

@app.route('/api/logout', methods=['POST'])
def api_logout():
    """Cerrar sesión"""
    session.clear()
    return jsonify({'success': True, 'message': 'Sesión cerrada'})

# ============= RUTAS DE USUARIO =============

@app.route('/dashboard')
@login_required
def dashboard():
    """Dashboard del usuario"""
    if session.get('rol') == 'ADMIN':
        return redirect(url_for('admin_panel'))
    return render_template('dashboard.html', user=session)

@app.route('/comprar')
@login_required
def comprar():
    """Página de compra de boletos"""
    return render_template('comprar.html', config=RAFFLE_CONFIG)

# ============= RUTAS DE ADMINISTRADOR =============

@app.route('/admin')
@login_required
def admin_panel():
    """Panel de administración"""
    if session.get('rol') != 'ADMIN':
        return redirect(url_for('dashboard'))
    return render_template('admin.html', user=session)

# ============= API BOLETOS =============

@app.route('/api/boletos')
def api_boletos():
    """Obtener estado de todos los boletos"""
    db = get_db()
    
    # Limpiar reservas expiradas
    db.execute('''
        UPDATE boletos 
        SET estado = 'disponible', reservado_hasta = NULL, usuario_id = NULL 
        WHERE estado = 'reservado' AND reservado_hasta < datetime('now', 'localtime')
    ''')
    db.commit()
    
    # Obtener todos los boletos
    boletos = db.execute('SELECT numero, estado FROM boletos ORDER BY numero').fetchall()
    db.close()
    
    return jsonify([{
        'numero': b['numero'],
        'estado': b['estado']
    } for b in boletos])

@app.route('/api/boletos/reservar', methods=['POST'])
@login_required
def api_reservar_boletos():
    """Reservar boletos para compra"""
    data = request.json
    numeros = data.get('numeros', [])
    
    if not numeros or not isinstance(numeros, list):
        return jsonify({'error': 'Debe seleccionar al menos un boleto'}), 400
    
    db = get_db()
    
    try:
        # Verificar que todos los boletos estén disponibles
        placeholders = ','.join('?' * len(numeros))
        query = f'SELECT numero, estado FROM boletos WHERE numero IN ({placeholders})'
        boletos = db.execute(query, numeros).fetchall()
        
        for boleto in boletos:
            if boleto['estado'] != 'disponible':
                return jsonify({'error': f'El boleto {boleto["numero"]} ya no está disponible'}), 400
        
        # Reservar boletos por 20 minutos
        reservado_hasta = datetime.now() + timedelta(minutes=20)
        for numero in numeros:
            db.execute('''
                UPDATE boletos 
                SET estado = 'reservado', usuario_id = ?, reservado_hasta = ? 
                WHERE numero = ?
            ''', (session['user_id'], reservado_hasta, numero))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'message': f'{len(numeros)} boleto(s) reservado(s) por 20 minutos',
            'boletos': numeros,
            'expira': reservado_hasta.isoformat()
        })
    
    except Exception as e:
        db.rollback()
        db.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/boletos/comprar', methods=['POST'])
@login_required
def api_comprar_boletos():
    """Completar compra de boletos con transferencia"""
    
    # Verificar datos del formulario
    folio = request.form.get('folio', '').strip()
    monto = request.form.get('monto', '').strip()
    fecha_transferencia = request.form.get('fecha', '').strip()
    nombre_comprador = request.form.get('nombre_comprador', '').strip()
    telefono_comprador = request.form.get('telefono_comprador', '').strip()
    nombre_vendedor = request.form.get('nombre_vendedor', '').strip()
    
    if not folio or not monto or not fecha_transferencia or not nombre_comprador or not telefono_comprador or not nombre_vendedor:
        return jsonify({'error': 'Todos los campos son requeridos'}), 400
    
    if len(telefono_comprador) < 10:
        return jsonify({'error': 'El teléfono debe tener al menos 10 dígitos'}), 400
    
    # Verificar archivo
    if 'comprobante' not in request.files:
        return jsonify({'error': 'Debe subir el comprobante de transferencia'}), 400
    
    file = request.files['comprobante']
    if file.filename == '':
        return jsonify({'error': 'Debe seleccionar un archivo'}), 400
    
    # Validar monto
    try:
        monto_float = float(monto)
    except:
        return jsonify({'error': 'Monto inválido'}), 400
    
    db = get_db()
    
    try:
        # Obtener boletos reservados por el usuario
        boletos_reservados = db.execute('''
            SELECT numero FROM boletos 
            WHERE usuario_id = ? AND estado = 'reservado' 
            AND reservado_hasta > datetime('now', 'localtime')
        ''', (session['user_id'],)).fetchall()
        
        if not boletos_reservados:
            return jsonify({'error': 'No tiene boletos reservados o la reserva expiró'}), 400
        
        num_boletos = len(boletos_reservados)
        total_esperado = num_boletos * RAFFLE_CONFIG['precio_boleto']
        
        # Validar monto
        if monto_float != total_esperado:
            return jsonify({
                'error': f'El monto debe ser ${total_esperado} ({num_boletos} boletos x ${RAFFLE_CONFIG["precio_boleto"]})'
            }), 400
        
        # Guardar archivo
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{session['user_id']}_{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Calcular hash del archivo
        file_hash = calcular_hash_archivo(filepath)
        
        # Verificar que el comprobante no haya sido usado antes
        existing = db.execute('SELECT id FROM transferencias WHERE comprobante_hash = ?', (file_hash,)).fetchone()
        if existing:
            os.remove(filepath)
            return jsonify({'error': 'Este comprobante ya ha sido utilizado anteriormente'}), 400
        
        # Verificar que el folio no exista
        existing_folio = db.execute('SELECT id FROM transferencias WHERE folio = ?', (folio,)).fetchone()
        if existing_folio:
            os.remove(filepath)
            return jsonify({'error': 'Este folio ya ha sido registrado'}), 400
        
        # Crear compra
        codigo_unico = generar_codigo_unico()
        db.execute('''
            INSERT INTO compras (usuario_id, total, estado, metodo, codigo_unico, vendedor_nombre, comprador_nombre, telefono_comprador) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (session['user_id'], monto_float, 'pendiente', 'transferencia', codigo_unico, nombre_vendedor, nombre_comprador, telefono_comprador))
        
        compra_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
        
        # Registrar transferencia
        db.execute('''
            INSERT INTO transferencias 
            (compra_id, folio, monto, fecha_transferencia, comprobante_url, comprobante_hash, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (compra_id, folio, monto_float, fecha_transferencia, filename, file_hash, 'pendiente'))
        
        # Actualizar boletos a pendiente de revisión
        numeros_boletos = [b['numero'] for b in boletos_reservados]
        for numero in numeros_boletos:
            db.execute('''
                UPDATE boletos 
                SET estado = 'pendiente', compra_id = ?, reservado_hasta = NULL 
                WHERE numero = ?
            ''', (compra_id, numero))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'message': 'Compra registrada correctamente. En breve validaremos tu transferencia.',
            'codigo': codigo_unico,
            'boletos': numeros_boletos
        })
    
    except Exception as e:
        db.rollback()
        db.close()
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': f'Error al procesar la compra: {str(e)}'}), 500

@app.route('/api/usuario/compras')
@login_required
def api_usuario_compras():
    """Obtener compras del usuario actual"""
    db = get_db()
    
    compras = db.execute('''
        SELECT 
            c.id, c.codigo_unico, c.total, c.estado, c.metodo, c.fecha_compra, c.vendedor_nombre, c.comprador_nombre, c.telefono_comprador,
            t.folio, t.monto, t.estado as estado_transferencia, t.notas_admin
        FROM compras c
        LEFT JOIN transferencias t ON c.id = t.compra_id
        WHERE c.usuario_id = ?
        ORDER BY c.fecha_compra DESC
    ''', (session['user_id'],)).fetchall()
    
    resultado = []
    for compra in compras:
        # Obtener boletos de esta compra
        boletos = db.execute('''
            SELECT numero, pdf_generado FROM boletos WHERE compra_id = ? ORDER BY numero
        ''', (compra['id'],)).fetchall()
        
        # Verificar si todos los boletos tienen PDF generado
        tiene_pdf = all(b['pdf_generado'] == 1 for b in boletos) and len(boletos) > 0
        
        resultado.append({
            'id': compra['id'],
            'codigo': compra['codigo_unico'],
            'total': compra['total'],
            'estado': compra['estado'],
            'metodo': compra['metodo'],
            'fecha': compra['fecha_compra'],
            'folio': compra['folio'],
            'estado_transferencia': compra['estado_transferencia'],
            'notas_admin': compra['notas_admin'],
            'vendedor': compra['vendedor_nombre'],
            'comprador': compra['comprador_nombre'],
            'telefono': compra['telefono_comprador'],
            'boletos': [b['numero'] for b in boletos],
            'tiene_pdf': tiene_pdf
        })
    
    db.close()
    return jsonify(resultado)

# ============= API ADMIN =============

@app.route('/api/admin/estadisticas')
@admin_required
def api_admin_estadisticas():
    """Obtener estadísticas generales"""
    db = get_db()
    
    # Contar boletos por estado
    stats = db.execute('''
        SELECT 
            SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
            SUM(CASE WHEN estado = 'vendido' THEN 1 ELSE 0 END) as vendidos,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
            SUM(CASE WHEN estado = 'fisico' THEN 1 ELSE 0 END) as fisicos
        FROM boletos
    ''').fetchone()
    
    # Contar usuarios
    usuarios = db.execute('SELECT COUNT(*) as total FROM usuarios WHERE rol = ?', ('USER',)).fetchone()
    
    # Ingresos totales
    ingresos = db.execute('SELECT SUM(total) as total FROM compras WHERE estado = ?', ('aprobada',)).fetchone()
    
    # Transferencias pendientes
    pendientes = db.execute('SELECT COUNT(*) as total FROM transferencias WHERE estado = ?', ('pendiente',)).fetchone()
    
    db.close()
    
    return jsonify({
        'boletos': {
            'disponibles': stats['disponibles'] or 0,
            'vendidos': stats['vendidos'] or 0,
            'pendientes': stats['pendientes'] or 0,
            'reservados': stats['reservados'] or 0,
            'fisicos': stats['fisicos'] or 0
        },
        'usuarios': usuarios['total'] or 0,
        'ingresos': ingresos['total'] or 0,
        'transferencias_pendientes': pendientes['total'] or 0
    })

@app.route('/api/admin/boletos-vendidos')
@admin_required
def api_admin_boletos_vendidos():
    """Obtener todos los boletos vendidos o pendientes con su información"""
    db = get_db()
    
    boletos = db.execute('''
        SELECT 
            b.numero, b.estado,
            c.comprador_nombre, c.vendedor_nombre,
            u.email as usuario_email
        FROM boletos b
        LEFT JOIN compras c ON b.compra_id = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE b.estado IN ('vendido', 'pendiente', 'fisico')
        ORDER BY b.numero ASC
    ''').fetchall()
    
    resultado = []
    for boleto in boletos:
        resultado.append({
            'numero': boleto['numero'],
            'estado': boleto['estado'],
            'comprador_nombre': boleto['comprador_nombre'],
            'vendedor_nombre': boleto['vendedor_nombre'],
            'usuario_email': boleto['usuario_email']
        })
    
    db.close()
    return jsonify(resultado)

@app.route('/api/admin/transferencias')
@admin_required
def api_admin_transferencias():
    """Obtener todas las transferencias pendientes"""
    db = get_db()
    
    transferencias = db.execute('''
        SELECT 
            t.id, t.compra_id, t.folio, t.monto, t.fecha_transferencia, 
            t.comprobante_url, t.estado, t.notas_admin, t.fecha_registro,
            c.codigo_unico, c.total, c.comprador_nombre, c.vendedor_nombre, c.telefono_comprador,
            u.nombre, u.email, u.telefono
        FROM transferencias t
        JOIN compras c ON t.compra_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE t.estado = 'pendiente'
        ORDER BY t.fecha_registro DESC
    ''').fetchall()
    
    resultado = []
    for t in transferencias:
        # Obtener boletos
        boletos = db.execute('''
            SELECT numero FROM boletos WHERE compra_id = ? ORDER BY numero
        ''', (t['compra_id'],)).fetchall()
        
        resultado.append({
            'id': t['id'],
            'compra_id': t['compra_id'],
            'folio': t['folio'],
            'monto': t['monto'],
            'fecha_transferencia': t['fecha_transferencia'],
            'comprobante_url': t['comprobante_url'],
            'estado': t['estado'],
            'notas_admin': t['notas_admin'],
            'fecha_registro': t['fecha_registro'],
            'codigo_compra': t['codigo_unico'],
            'total_compra': t['total'],
            'comprador_nombre': t['comprador_nombre'],
            'telefono_comprador': t['telefono_comprador'],
            'vendedor_nombre': t['vendedor_nombre'],
            'usuario': {
                'nombre': t['nombre'],
                'email': t['email'],
                'telefono': t['telefono']
            },
            'boletos': [b['numero'] for b in boletos]
        })
    
    db.close()
    return jsonify(resultado)

@app.route('/api/admin/transferencias/<int:transferencia_id>/aprobar', methods=['POST'])
@admin_required
def api_admin_aprobar_transferencia(transferencia_id):
    """Aprobar una transferencia"""
    data = request.json
    notas = data.get('notas', '')
    
    db = get_db()
    
    try:
        # Obtener transferencia y compra
        transferencia = db.execute('''
            SELECT c.id as compra_id, c.vendedor_nombre, c.comprador_nombre
            FROM transferencias t
            JOIN compras c ON t.compra_id = c.id
            WHERE t.id = ?
        ''', (transferencia_id,)).fetchone()
        
        if not transferencia:
            return jsonify({'error': 'Transferencia no encontrada'}), 404
        
        # Verificar que tenga vendedor y comprador
        if not transferencia['vendedor_nombre'] or not transferencia['comprador_nombre']:
            return jsonify({'error': 'La transferencia no tiene información completa de vendedor o comprador'}), 400
        
        # Actualizar transferencia
        db.execute('''
            UPDATE transferencias 
            SET estado = 'aprobada', notas_admin = ? 
            WHERE id = ?
        ''', (notas, transferencia_id))
        
        # Actualizar compra
        db.execute('''
            UPDATE compras 
            SET estado = 'aprobada' 
            WHERE id = ?
        ''', (transferencia['compra_id'],))
        
        # Actualizar boletos a vendido
        db.execute('''
            UPDATE boletos 
            SET estado = 'vendido' 
            WHERE compra_id = ?
        ''', (transferencia['compra_id'],))
        
        db.commit()
        db.close()
        
        return jsonify({'success': True, 'message': 'Transferencia aprobada correctamente'})
    
    except Exception as e:
        db.rollback()
        db.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/transferencias/<int:transferencia_id>/rechazar', methods=['POST'])
@admin_required
def api_admin_rechazar_transferencia(transferencia_id):
    """Rechazar una transferencia"""
    data = request.json
    motivo = data.get('motivo', '').strip()
    
    if not motivo:
        return jsonify({'error': 'Debe proporcionar un motivo del rechazo'}), 400
    
    db = get_db()
    
    try:
        # Obtener transferencia
        transferencia = db.execute('''
            SELECT compra_id FROM transferencias WHERE id = ?
        ''', (transferencia_id,)).fetchone()
        
        if not transferencia:
            return jsonify({'error': 'Transferencia no encontrada'}), 404
        
        # Actualizar transferencia
        db.execute('''
            UPDATE transferencias 
            SET estado = 'rechazada', notas_admin = ? 
            WHERE id = ?
        ''', (motivo, transferencia_id))
        
        # Actualizar compra
        db.execute('''
            UPDATE compras 
            SET estado = 'rechazada' 
            WHERE id = ?
        ''', (transferencia['compra_id'],))
        
        # Liberar boletos
        db.execute('''
            UPDATE boletos 
            SET estado = 'disponible', usuario_id = NULL, compra_id = NULL, reservado_hasta = NULL 
            WHERE compra_id = ?
        ''', (transferencia['compra_id'],))
        
        db.commit()
        db.close()
        
        return jsonify({'success': True, 'message': 'Transferencia rechazada. Boletos liberados.'})
    
    except Exception as e:
        db.rollback()
        db.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/venta-fisica', methods=['POST'])
@admin_required
def api_admin_venta_fisica():
    """Registrar venta física"""
    data = request.json
    
    boletos = data.get('boletos', [])
    nombre_cliente = data.get('nombre', '').strip()
    telefono = data.get('telefono', '').strip()
    notas = data.get('notas', '').strip()
    vendedor = data.get('vendedor', '').strip()
    
    if not boletos or not isinstance(boletos, list):
        return jsonify({'error': 'Debe seleccionar al menos un boleto'}), 400
    
    if not vendedor:
        return jsonify({'error': 'Debe especificar el nombre del vendedor'}), 400
    
    if not nombre_cliente:
        return jsonify({'error': 'Debe especificar el nombre del cliente'}), 400
    
    db = get_db()
    
    try:
        # Verificar que todos los boletos estén disponibles
        placeholders = ','.join('?' * len(boletos))
        query = f'SELECT numero, estado FROM boletos WHERE numero IN ({placeholders})'
        boletos_db = db.execute(query, boletos).fetchall()
        
        for boleto in boletos_db:
            if boleto['estado'] != 'disponible':
                return jsonify({'error': f'El boleto {boleto["numero"]} no está disponible'}), 400
        
        # Crear compra
        codigo_unico = generar_codigo_unico()
        total = len(boletos) * RAFFLE_CONFIG['precio_boleto']
        nota_final = f"Cliente: {nombre_cliente}\nTeléfono: {telefono}\nVendedor: {vendedor}\n{notas}"
        
        db.execute('''
            INSERT INTO compras (usuario_id, total, estado, metodo, codigo_unico, vendedor_nombre, comprador_nombre) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (session['user_id'], total, 'aprobada', 'fisico', codigo_unico, vendedor, nombre_cliente))
        
        compra_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
        
        # Actualizar boletos
        for numero in boletos:
            db.execute('''
                UPDATE boletos 
                SET estado = 'fisico', compra_id = ?, nota = ? 
                WHERE numero = ?
            ''', (compra_id, nota_final, numero))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'message': f'Venta física registrada correctamente. Código: {codigo_unico}',
            'codigo': codigo_unico,
            'total': total
        })
    
    except Exception as e:
        db.rollback()
        db.close()
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    """Servir archivos subidos (solo para admins)"""
    if session.get('rol') != 'ADMIN':
        return "Acceso denegado", 403
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ============= API GENERACIÓN Y DESCARGA DE PDFs =============

@app.route('/api/admin/generar-pdfs', methods=['POST'])
@admin_required
def api_admin_generar_pdfs():
    """Generar PDFs de boletos vendidos usando la API externa"""
    data = request.json
    
    boletos = data.get('boletos', [])
    template = data.get('template', 'gris')  # gris o negro
    associate = data.get('associate', True)  # agrupar de 4 en 4
    
    if not boletos or not isinstance(boletos, list):
        return jsonify({'error': 'Debe proporcionar una lista de boletos'}), 400
    
    db = get_db()
    
    try:
        # Verificar que los boletos existan y estén vendidos o aprobados
        placeholders = ','.join('?' * len(boletos))
        query = f'SELECT numero, estado, pdf_generado FROM boletos WHERE numero IN ({placeholders})'
        boletos_db = db.execute(query, boletos).fetchall()
        
        boletos_map = {b['numero']: b for b in boletos_db}
        
        for num in boletos:
            if num not in boletos_map:
                return jsonify({'error': f'El boleto {num} no existe'}), 400
            
            boleto = boletos_map[num]
            if boleto['estado'] not in ('vendido', 'fisico'):
                return jsonify({'error': f'El boleto {num} no está vendido (estado: {boleto["estado"]})'}), 400
        
        # Llamar a la API para generar los PDFs
        numbers_str = ','.join(map(str, boletos))
        api_url = f'{TICKETS_API_BASE}/ticket'
        params = {
            'numbers': numbers_str,
            'template': template,
            'associate': str(associate).lower()
        }
        
        print(f'Generando PDFs: {api_url} con params: {params}')
        
        response = requests.get(api_url, params=params, timeout=30)
        
        if response.status_code != 200:
            return jsonify({'error': f'Error en la API de tickets: {response.text}'}), 500
        
        result = response.json()
        files_to_download = result.get('tickets', [])
        
        if not files_to_download:
            return jsonify({'error': 'La API no devolvió archivos'}), 500
        
        # Descargar los PDFs
        download_url = f'{TICKETS_API_BASE}/download'
        download_params = {'files': ','.join(files_to_download)}
        
        print(f'Descargando PDFs: {download_url} con params: {download_params}')
        
        download_response = requests.get(download_url, params=download_params, timeout=60)
        
        if download_response.status_code != 200:
            return jsonify({'error': 'Error al descargar los PDFs generados'}), 500
        
        # Guardar el archivo ZIP
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        zip_filename = f'boletos_{timestamp}.zip'
        zip_path = os.path.join(app.config['TICKETS_FOLDER'], zip_filename)
        
        with open(zip_path, 'wb') as f:
            f.write(download_response.content)
        
        # Marcar boletos como PDF generado
        for num in boletos:
            db.execute('''
                UPDATE boletos 
                SET pdf_generado = 1, pdf_filename = ? 
                WHERE numero = ?
            ''', (zip_filename, num))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'message': f'PDFs generados correctamente para {len(boletos)} boleto(s)',
            'filename': zip_filename,
            'boletos': boletos
        })
    
    except requests.exceptions.RequestException as e:
        db.close()
        return jsonify({'error': f'Error de conexión con la API: {str(e)}'}), 500
    
    except Exception as e:
        db.rollback()
        db.close()
        return jsonify({'error': f'Error al generar PDFs: {str(e)}'}), 500

@app.route('/api/descargar-boletos')
@login_required
def api_descargar_boletos():
    """Descargar PDFs de los boletos del usuario"""
    db = get_db()
    
    try:
        # Obtener boletos aprobados del usuario con PDF generado
        boletos = db.execute('''
            SELECT DISTINCT b.pdf_filename, b.numero
            FROM boletos b
            JOIN compras c ON b.compra_id = c.id
            WHERE c.usuario_id = ? 
            AND b.estado IN ('vendido', 'fisico')
            AND b.pdf_generado = 1
            AND b.pdf_filename IS NOT NULL
            ORDER BY b.numero
        ''', (session['user_id'],)).fetchall()
        
        if not boletos:
            return jsonify({'error': 'No tienes boletos con PDF generado'}), 404
        
        # Agrupar por archivo ZIP
        archivos_zip = {}
        for boleto in boletos:
            zip_name = boleto['pdf_filename']
            if zip_name not in archivos_zip:
                archivos_zip[zip_name] = []
            archivos_zip[zip_name].append(boleto['numero'])
        
        # Si solo hay un archivo ZIP, enviarlo directamente
        if len(archivos_zip) == 1:
            zip_name = list(archivos_zip.keys())[0]
            zip_path = os.path.join(app.config['TICKETS_FOLDER'], zip_name)
            
            if not os.path.exists(zip_path):
                return jsonify({'error': 'El archivo de boletos no se encuentra'}), 404
            
            return send_file(
                zip_path,
                as_attachment=True,
                download_name=f'mis_boletos_{session["user_id"]}.zip',
                mimetype='application/zip'
            )
        
        # Si hay múltiples archivos ZIP, crear uno nuevo con todos los PDFs del usuario
        memory_zip = io.BytesIO()
        with zipfile.ZipFile(memory_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
            for zip_name, nums in archivos_zip.items():
                zip_path = os.path.join(app.config['TICKETS_FOLDER'], zip_name)
                
                if not os.path.exists(zip_path):
                    continue
                
                # Extraer PDFs del ZIP original que correspondan a los números del usuario
                with zipfile.ZipFile(zip_path, 'r') as original_zip:
                    for file_info in original_zip.filelist:
                        # Intentar identificar el número de boleto en el nombre del archivo
                        filename = file_info.filename
                        # Los archivos suelen llamarse "1.pdf", "2.pdf", etc.
                        try:
                            file_num = int(filename.split('.')[0].split('_')[-1])
                            if file_num in nums:
                                data = original_zip.read(file_info)
                                zf.writestr(filename, data)
                        except:
                            # Si no podemos identificar el número, incluir el archivo de todas formas
                            data = original_zip.read(file_info)
                            zf.writestr(filename, data)
        
        memory_zip.seek(0)
        db.close()
        
        return send_file(
            memory_zip,
            as_attachment=True,
            download_name=f'mis_boletos_{session["user_id"]}.zip',
            mimetype='application/zip'
        )
    
    except Exception as e:
        db.close()
        return jsonify({'error': f'Error al descargar boletos: {str(e)}'}), 500

# ============= INICIALIZACIÓN =============

if __name__ == '__main__':
    init_db()
    print('='*60)
    print('SISTEMA DE RIFA ALTRUISTA - Version Simple')
    print('='*60)
    print('')
    print('Base de datos inicializada')
    print('')
    print('Usuario Admin creado:')
    print('   Email: admin@rifa.com')
    print('   Contrasena: admin123')
    print('')
    print('Servidor corriendo en: http://localhost:5000')
    print('')
    print('Presiona Ctrl+C para detener el servidor')
    print('='*60)
    print('')
    
    app.run(debug=True, host='0.0.0.0', port=5000)


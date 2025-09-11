// Firebase Configuration and Functions
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBt5IR0jg2sye3S1XdWxP0FBWZFP8D4OdQ",
    authDomain: "paedigital2025.firebaseapp.com",
    projectId: "paedigital2025",
    storageBucket: "paedigital2025.firebasestorage.app",
    messagingSenderId: "740229563465",
    appId: "1:740229563465:web:2f740a1f2a33b1ff29ab98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Hacer las variables globales
window.db = db;
window.auth = auth;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.doc = doc;
window.updateDoc = updateDoc;
window.deleteDoc = deleteDoc;
window.query = query;
window.orderBy = orderBy;
window.where = where;
window.onSnapshot = onSnapshot;

// Función para actualizar el indicador de estado
function actualizarIndicadorFirebase(estado, mensaje) {
    const indicador = document.getElementById('indicador-conexion');
    const texto = document.getElementById('firebase-status-text');
    
    if (indicador && texto) {
        indicador.className = `firebase-status ${estado}`;
        texto.textContent = mensaje;
        
        switch(estado) {
            case 'connected':
                indicador.innerHTML = '🔥 Firebase: Conectado';
                break;
            case 'disconnected':
                indicador.innerHTML = '🔥 Firebase: Desconectado';
                break;
            case 'syncing':
                indicador.innerHTML = '🔥 Firebase: Sincronizando...';
                break;
        }
    }
}

// Función para mostrar notificaciones de Firebase
function mostrarNotificacionFirebase(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `firebase-notification ${tipo}`;
    notificacion.textContent = mensaje;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Autenticación anónima
signInAnonymously(auth).then(() => {
    console.log('✅ Autenticado anónimamente con Firebase');
    actualizarIndicadorFirebase('connected', 'Conectado a Firebase - Datos sincronizados');
}).catch((error) => {
    console.error('❌ Error de autenticación:', error);
    actualizarIndicadorFirebase('disconnected', 'Error de conexión - Modo local');
});

// ==================== FUNCIONES PARA MOVIMIENTOS ====================

// Función para agregar movimiento a Firebase
window.agregarMovimientoFirebase = async function(movimiento) {
    try {
        const docRef = await addDoc(collection(db, "movimientos"), {
            ...movimiento,
            timestamp: new Date().toISOString(),
            fechaCreacion: new Date().toISOString()
        });
        console.log("✅ Movimiento agregado con ID: ", docRef.id);
        
        // Actualizar localStorage también
        const movimientos = JSON.parse(localStorage.getItem('movimientos') || '[]');
        movimientos.unshift({ id: docRef.id, ...movimiento, timestamp: new Date().toISOString() });
        localStorage.setItem('movimientos', JSON.stringify(movimientos));
        
        return docRef.id;
    } catch (error) {
        console.error("❌ Error agregando movimiento: ", error);
        throw error;
    }
};

// Función para obtener movimientos de Firebase
window.obtenerMovimientosFirebase = async function() {
    try {
        const q = query(collection(db, "movimientos"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const movimientos = [];
        querySnapshot.forEach((doc) => {
            movimientos.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ Obtenidos ${movimientos.length} movimientos de Firebase`);
        return movimientos;
    } catch (error) {
        console.error("❌ Error obteniendo movimientos: ", error);
        return [];
    }
};

// ==================== FUNCIONES PARA PRODUCTOS ====================

// Función para agregar producto a Firebase
window.agregarProductoFirebase = async function(producto) {
    try {
        const docRef = await addDoc(collection(db, "productos"), {
            ...producto,
            ultimaActualizacion: new Date().toISOString(),
            fechaCreacion: new Date().toISOString()
        });
        console.log("✅ Producto agregado con ID: ", docRef.id);
        
        // Actualizar localStorage también
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        productos.push({ id: docRef.id, ...producto, ultimaActualizacion: new Date().toISOString() });
        localStorage.setItem('productos', JSON.stringify(productos));
        
        return docRef.id;
    } catch (error) {
        console.error("❌ Error agregando producto: ", error);
        throw error;
    }
};

// Función para obtener productos de Firebase
window.obtenerProductosFirebase = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productos = [];
        querySnapshot.forEach((doc) => {
            productos.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ Obtenidos ${productos.length} productos de Firebase`);
        return productos;
    } catch (error) {
        console.error("❌ Error obteniendo productos: ", error);
        return [];
    }
};

// Función para actualizar producto en Firebase
window.actualizarProductoFirebase = async function(productoId, datosActualizados) {
    try {
        const productoRef = doc(db, "productos", productoId);
        await updateDoc(productoRef, {
            ...datosActualizados,
            ultimaActualizacion: new Date().toISOString()
        });
        console.log("✅ Producto actualizado con ID: ", productoId);
        
        // Actualizar localStorage también
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const index = productos.findIndex(p => p.id === productoId);
        if (index !== -1) {
            productos[index] = { ...productos[index], ...datosActualizados, ultimaActualizacion: new Date().toISOString() };
            localStorage.setItem('productos', JSON.stringify(productos));
        }
        
    } catch (error) {
        console.error("❌ Error actualizando producto: ", error);
        throw error;
    }
};

// Función para eliminar producto de Firebase
window.eliminarProductoFirebase = async function(productoId) {
    try {
        await deleteDoc(doc(db, "productos", productoId));
        console.log("✅ Producto eliminado con ID: ", productoId);
        
        // Actualizar localStorage también
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const productosFiltrados = productos.filter(p => p.id !== productoId);
        localStorage.setItem('productos', JSON.stringify(productosFiltrados));
        
    } catch (error) {
        console.error("❌ Error eliminando producto: ", error);
        throw error;
    }
};

// ==================== FUNCIONES PARA SEDES ====================

// Función para agregar sede a Firebase
window.agregarSedeFirebase = async function(sede) {
    try {
        const docRef = await addDoc(collection(db, "sedes"), {
            ...sede,
            fechaCreacion: new Date().toISOString()
        });
        console.log("✅ Sede agregada con ID: ", docRef.id);
        
        // Actualizar localStorage también
        const sedes = JSON.parse(localStorage.getItem('sedes') || '[]');
        sedes.push({ id: docRef.id, ...sede, fechaCreacion: new Date().toISOString() });
        localStorage.setItem('sedes', JSON.stringify(sedes));
        
        return docRef.id;
    } catch (error) {
        console.error("❌ Error agregando sede: ", error);
        throw error;
    }
};

// Función para obtener sedes de Firebase
window.obtenerSedesFirebase = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "sedes"));
        const sedes = [];
        querySnapshot.forEach((doc) => {
            sedes.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ Obtenidas ${sedes.length} sedes de Firebase`);
        return sedes;
    } catch (error) {
        console.error("❌ Error obteniendo sedes: ", error);
        return [];
    }
};

// ==================== FUNCIONES DE SINCRONIZACIÓN ====================

// Función para sincronizar datos locales con Firebase
window.sincronizarConFirebase = async function() {
    try {
        console.log('🔄 Iniciando sincronización con Firebase...');
        actualizarIndicadorFirebase('syncing', 'Sincronizando datos con Firebase...');
        
        // Obtener datos de Firebase
        const movimientosFirebase = await obtenerMovimientosFirebase();
        const productosFirebase = await obtenerProductosFirebase();
        const sedesFirebase = await obtenerSedesFirebase();

        // Actualizar localStorage con datos de Firebase
        localStorage.setItem('movimientos', JSON.stringify(movimientosFirebase));
        localStorage.setItem('productos', JSON.stringify(productosFirebase));
        localStorage.setItem('sedes', JSON.stringify(sedesFirebase));

        console.log('✅ Datos sincronizados con Firebase');
        actualizarIndicadorFirebase('connected', 'Datos sincronizados con Firebase');
        
        // Mostrar notificación de éxito
        mostrarNotificacionFirebase('Datos sincronizados exitosamente', 'success');
        
        return true;
    } catch (error) {
        console.error('❌ Error sincronizando con Firebase:', error);
        actualizarIndicadorFirebase('disconnected', 'Error de sincronización - Modo local');
        mostrarNotificacionFirebase('Error de sincronización con Firebase', 'error');
        return false;
    }
};

// Función para migrar datos locales a Firebase
window.migrarDatosAFirebase = async function() {
    try {
        console.log('🔄 Iniciando migración de datos locales a Firebase...');
        
        // Obtener datos locales
        const movimientosLocales = JSON.parse(localStorage.getItem('movimientos') || '[]');
        const productosLocales = JSON.parse(localStorage.getItem('productos') || '[]');
        const sedesLocales = JSON.parse(localStorage.getItem('sedes') || '[]');

        let movimientosMigrados = 0;
        let productosMigrados = 0;
        let sedesMigradas = 0;

        // Migrar movimientos
        for (const movimiento of movimientosLocales) {
            if (movimiento.id && !movimiento.id.startsWith('firebase_')) {
                await agregarMovimientoFirebase(movimiento);
                movimientosMigrados++;
            }
        }

        // Migrar productos
        for (const producto of productosLocales) {
            if (producto.id && !producto.id.startsWith('firebase_')) {
                await agregarProductoFirebase(producto);
                productosMigrados++;
            }
        }

        // Migrar sedes
        for (const sede of sedesLocales) {
            if (sede.id && !sede.id.startsWith('firebase_')) {
                await agregarSedeFirebase(sede);
                sedesMigradas++;
            }
        }

        console.log(`✅ Migración completada: ${movimientosMigrados} movimientos, ${productosMigrados} productos, ${sedesMigradas} sedes`);
        return true;
    } catch (error) {
        console.error('❌ Error en migración:', error);
        return false;
    }
};

// ==================== FUNCIONES DE UTILIDAD ====================

// Función para verificar conexión con Firebase
window.verificarConexionFirebase = async function() {
    try {
        const testDoc = await addDoc(collection(db, "test"), {
            timestamp: new Date().toISOString(),
            test: true
        });
        await deleteDoc(doc(db, "test", testDoc.id));
        console.log('✅ Conexión con Firebase verificada');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión con Firebase:', error);
        return false;
    }
};

// Función para limpiar datos de prueba
window.limpiarDatosPrueba = async function() {
    try {
        console.log('🧹 Limpiando datos de prueba...');
        
        // Obtener todos los documentos de prueba
        const movimientos = await getDocs(collection(db, "movimientos"));
        const productos = await getDocs(collection(db, "productos"));
        const sedes = await getDocs(collection(db, "sedes"));
        
        // Eliminar movimientos de prueba
        for (const doc of movimientos.docs) {
            if (doc.data().producto && doc.data().producto.includes('PRUEBA')) {
                await deleteDoc(doc.ref);
            }
        }
        
        // Eliminar productos de prueba
        for (const doc of productos.docs) {
            if (doc.data().producto && doc.data().producto.includes('PRUEBA')) {
                await deleteDoc(doc.ref);
            }
        }
        
        console.log('✅ Datos de prueba eliminados');
        return true;
    } catch (error) {
        console.error('❌ Error limpiando datos de prueba:', error);
        return false;
    }
};

// ==================== INICIALIZACIÓN ====================

        // Inicializar cuando la página esté lista
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Inicializando Firebase...');
            
            // Verificar conexión
            verificarConexionFirebase().then((conectado) => {
                if (conectado) {
                    // Verificar si hay datos locales para migrar
                    const movimientosLocales = JSON.parse(localStorage.getItem('movimientos') || '[]');
                    if (movimientosLocales.length > 0) {
                        console.log('📦 Datos locales encontrados, iniciando migración...');
                        migrarDatosAFirebase().then(() => {
                            console.log('✅ Migración completada, sincronizando...');
                            sincronizarConFirebase();
                        });
                    } else {
                        console.log('🔄 Sincronizando con Firebase...');
                        sincronizarConFirebase();
                    }
                } else {
                    console.log('⚠️ Usando modo offline (datos locales)');
                }
            });
            
            // Sincronización automática al cargar la página
            setTimeout(() => {
                if (window.sincronizarConFirebase) {
                    console.log('🔄 Sincronización automática al cargar página...');
                    sincronizarConFirebase();
                }
            }, 2000); // Esperar 2 segundos para que todo esté listo
        });

// Exportar para uso global
window.FirebaseConfig = {
    db,
    auth,
    app,
    config: firebaseConfig
};

console.log('🔥 Firebase configurado correctamente');

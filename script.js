// ---------- MODELO DE DATOS ----------
let posts = [];
let comentarios = [];

// Cargar desde localStorage
function loadData() {
    const storedPosts = localStorage.getItem('muroazul_posts');
    if(storedPosts) posts = JSON.parse(storedPosts);
    const storedComents = localStorage.getItem('muroazul_comentarios');
    if(storedComents) comentarios = JSON.parse(storedComents);
    if(!posts.length) {
        posts.push({
            id: Date.now(),
            titulo: "Bienvenida al Muro Azul",
            texto: "Puedes subir posts con imágenes, videos, links y editarlos. Los posts se guardan en tu navegador.",
            imagen: "https://picsum.photos/id/20/800/400",
            video: "",
            link: "https://ejemplo.com",
            privado: "publico",
            fecha: new Date().toLocaleString()
        });
    }
    if(!comentarios.length) {
        comentarios.push({ id: Date.now()+1, nombre: "Admin Azul", texto: "¡Primer comentario! Me encanta la web.", fecha: new Date().toLocaleString() });
    }
}

function saveData() {
    localStorage.setItem('muroazul_posts', JSON.stringify(posts));
    localStorage.setItem('muroazul_comentarios', JSON.stringify(comentarios));
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

// Renderizar posts con filtros y búsqueda
function renderPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const privFilter = document.getElementById('filterPrivado').value;
    
    let filtered = [...posts];
    if(privFilter !== 'todos') {
        filtered = filtered.filter(p => p.privado === privFilter);
    }
    if(searchTerm) {
        filtered = filtered.filter(p => p.titulo.toLowerCase().includes(searchTerm) || p.texto.toLowerCase().includes(searchTerm));
    }
    filtered.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    
    const container = document.getElementById('postsContainer');
    if(filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; background:#f5faff; border-radius:50px;">📭 No hay posts que coincidan</div>`;
        document.getElementById('postCount').innerText = `0 posts`;
        return;
    }
    document.getElementById('postCount').innerText = `${filtered.length} post${filtered.length!==1?'s':''}`;
    
    let html = '';
    filtered.forEach(post => {
        const privClass = post.privado === 'privado' ? 'privado' : 'publico';
        const privText = post.privado === 'privado' ? '🔒 Privado' : '🌍 Público';
        
        let mediaHtml = '';
        if(post.imagen && post.imagen.trim() !== '') {
            mediaHtml += `<div class="media-content"><img src="${escapeHtml(post.imagen)}" alt="imagen" loading="lazy" onerror="this.style.display='none'"></div>`;
        }
        if(post.video && post.video.trim() !== '') {
            let videoUrl = post.video.trim();
            let embed = '';
            if(videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be')) {
                let vidId = '';
                if(videoUrl.includes('youtu.be/')) vidId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                else if(videoUrl.includes('v=')) vidId = videoUrl.split('v=')[1]?.split('&')[0];
                if(vidId) embed = `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${vidId}" frameborder="0" allowfullscreen></iframe>`;
                else embed = `<video controls width="100%"><source src="${videoUrl}" type="video/mp4">Tu navegador no soporta video</video>`;
            } else {
                embed = `<video controls width="100%"><source src="${videoUrl}" type="video/mp4">Video no disponible</video>`;
            }
            mediaHtml += `<div class="media-content">${embed}</div>`;
        }
        if(post.link && post.link.trim() !== '') {
            mediaHtml += `<div class="link-url"><a href="${escapeHtml(post.link)}" target="_blank"><i class="fas fa-external-link-alt"></i> ${escapeHtml(post.link.length>50 ? post.link.substring(0,50)+'...' : post.link)}</a></div>`;
        }
        
        html += `
            <div class="post-card" data-id="${post.id}">
                <div class="post-header">
                    <div class="post-titulo">${escapeHtml(post.titulo)} <span class="badge ${privClass}">${privText}</span></div>
                    <div class="post-fecha"><i class="far fa-calendar-alt"></i> ${escapeHtml(post.fecha)}</div>
                </div>
                <div class="post-contenido">
                    <div class="post-texto">${escapeHtml(post.texto).replace(/\n/g, '<br>')}</div>
                    ${mediaHtml}
                </div>
                <div class="post-actions">
                    <button class="btn-sm btn-outline edit-post" data-id="${post.id}"><i class="fas fa-pen"></i> Editar</button>
                    <button class="btn-sm btn-danger delete-post" data-id="${post.id}"><i class="fas fa-trash"></i> Eliminar</button>
                    <button class="btn-sm toggle-privado" data-id="${post.id}"><i class="fas fa-lock"></i> ${post.privado === 'privado' ? 'Hacer público' : 'Hacer privado'}</button>
                    <div class="compartir-btns">
                        <span><i class="fas fa-share-alt"></i> Compartir:</span>
                        <button class="btn-sm share-btn" data-platform="facebook" data-id="${post.id}"><i class="fab fa-facebook"></i></button>
                        <button class="btn-sm share-btn" data-platform="twitter" data-id="${post.id}"><i class="fab fa-twitter"></i></button>
                        <button class="btn-sm share-btn" data-platform="whatsapp" data-id="${post.id}"><i class="fab fa-whatsapp"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    
    // eventos dinámicos
    document.querySelectorAll('.edit-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            openEditModal(id);
        });
    });
    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            if(confirm('¿Eliminar este post permanentemente?')) {
                posts = posts.filter(p => p.id !== id);
                saveData();
                renderPosts();
            }
        });
    });
    document.querySelectorAll('.toggle-privado').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const post = posts.find(p => p.id === id);
            if(post) {
                post.privado = post.privado === 'privado' ? 'publico' : 'privado';
                saveData();
                renderPosts();
            }
        });
    });
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const post = posts.find(p => p.id === id);
            if(post) {
                const platform = btn.dataset.platform;
                const titulo = encodeURIComponent(post.titulo);
                const url = encodeURIComponent(window.location.href);
                let shareLink = '';
                if(platform === 'facebook') shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                else if(platform === 'twitter') shareLink = `https://twitter.com/intent/tweet?text=${titulo}&url=${url}`;
                else if(platform === 'whatsapp') shareLink = `https://api.whatsapp.com/send?text=${titulo} ${url}`;
                if(shareLink) window.open(shareLink, '_blank');
                else alert("Compartir no disponible");
            }
        });
    });
}

function openEditModal(id) {
    const post = posts.find(p => p.id === id);
    if(!post) return;
    document.getElementById('editPostId').value = post.id;
    document.getElementById('editTitulo').value = post.titulo;
    document.getElementById('editTexto').value = post.texto;
    document.getElementById('editImagen').value = post.imagen || '';
    document.getElementById('editVideo').value = post.video || '';
    document.getElementById('editLink').value = post.link || '';
    document.getElementById('editPrivado').value = post.privado;
    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveEdit() {
    const id = parseInt(document.getElementById('editPostId').value);
    const index = posts.findIndex(p => p.id === id);
    if(index !== -1) {
        posts[index].titulo = document.getElementById('editTitulo').value.trim() || "Sin título";
        posts[index].texto = document.getElementById('editTexto').value;
        posts[index].imagen = document.getElementById('editImagen').value;
        posts[index].video = document.getElementById('editVideo').value;
        posts[index].link = document.getElementById('editLink').value;
        posts[index].privado = document.getElementById('editPrivado').value;
        posts[index].fecha = new Date().toLocaleString() + " (editado)";
        saveData();
        renderPosts();
        closeModal();
    }
}

function publicarNuevoPost() {
    const titulo = document.getElementById('postTitulo').value.trim();
    if(!titulo) { alert("El título es obligatorio"); return; }
    const texto = document.getElementById('postTexto').value;
    const imagen = document.getElementById('postImagen').value;
    const video = document.getElementById('postVideo').value;
    const link = document.getElementById('postLink').value;
    const privado = document.getElementById('postPrivado').value;
    const nuevoPost = {
        id: Date.now(),
        titulo: titulo,
        texto: texto,
        imagen: imagen,
        video: video,
        link: link,
        privado: privado,
        fecha: new Date().toLocaleString()
    };
    posts.unshift(nuevoPost);
    saveData();
    document.getElementById('postTitulo').value = '';
    document.getElementById('postTexto').value = '';
    document.getElementById('postImagen').value = '';
    document.getElementById('postVideo').value = '';
    document.getElementById('postLink').value = '';
    document.getElementById('postPrivado').value = 'publico';
    renderPosts();
}

function renderComentarios() {
    const container = document.getElementById('comentariosLista');
    if(!comentarios.length) {
        container.innerHTML = '<div style="text-align:center; padding:15px;">💬 Aún no hay comentarios. ¡Sé el primero!</div>';
        return;
    }
    let html = '';
    comentarios.slice().reverse().forEach(c => {
        html += `<div class="comentario-item">
                    <div class="comentario-nombre"><i class="fas fa-user-circle"></i> ${escapeHtml(c.nombre)} <span class="comentario-fecha">${escapeHtml(c.fecha)}</span></div>
                    <div class="comentario-texto">${escapeHtml(c.texto)}</div>
                </div>`;
    });
    container.innerHTML = html;
}

function agregarComentario() {
    let nombre = document.getElementById('comentNombre').value.trim();
    const texto = document.getElementById('comentTexto').value.trim();
    if(!texto) { alert("Escribe un comentario"); return; }
    if(!nombre) nombre = "Anónimo";
    const nuevo = {
        id: Date.now(),
        nombre: nombre,
        texto: texto,
        fecha: new Date().toLocaleString()
    };
    comentarios.push(nuevo);
    saveData();
    renderComentarios();
    document.getElementById('comentNombre').value = '';
    document.getElementById('comentTexto').value = '';
}

// EVENTOS INICIALES
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderPosts();
    renderComentarios();
    
    document.getElementById('btnPublicar').addEventListener('click', publicarNuevoPost);
    document.getElementById('btnComentar').addEventListener('click', agregarComentario);
    document.getElementById('searchInput').addEventListener('input', () => renderPosts());
    document.getElementById('clearSearch').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        renderPosts();
    });
    document.getElementById('filterPrivado').addEventListener('change', () => renderPosts());
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
    window.addEventListener('click', (e) => { if(e.target === document.getElementById('editModal')) closeModal(); });
});
# 📦 Guía: Subir a Otro Repositorio

Tienes varias opciones para subir tu proyecto a otro repositorio.

---

## Opción 1: Agregar Segundo Remoto (Mantener Ambos)

Si quieres mantener ambos repositorios y poder subir a cualquiera:

### 1. Agregar el nuevo remoto con un nombre diferente
```bash
# Ejemplo: agregar como "upstream" o "universidad"
git remote add otro https://github.com/usuario/nuevo-repositorio.git
```

### 2. Verificar que se agregó
```bash
git remote -v
```

### 3. Subir al nuevo repositorio
```bash
# Subir la rama actual al nuevo remoto
git push otro sqlite-native

# O subir todas las ramas
git push otro --all
```

### 4. Usar ambos repositorios
```bash
# Subir a origin (repositorio original)
git push origin sqlite-native

# Subir a otro (nuevo repositorio)
git push otro sqlite-native
```

---

## Opción 2: Cambiar el Remoto Principal

Si quieres cambiar completamente a otro repositorio:

### 1. Cambiar la URL del remoto origin
```bash
git remote set-url origin https://github.com/usuario/nuevo-repositorio.git
```

### 2. Verificar el cambio
```bash
git remote -v
```

### 3. Subir al nuevo repositorio
```bash
git push origin sqlite-native
```

---

## Opción 3: Remoto con Nombre Personalizado

Puedes agregar varios remotos con nombres diferentes:

```bash
# Agregar remoto para universidad
git remote add universidad https://github.com/universidad/proyecto.git

# Agregar remoto para backup
git remote add backup https://github.com/mi-usuario/backup.git

# Subir a cada uno
git push universidad sqlite-native
git push backup sqlite-native
```

---

## 📋 Pasos Recomendados

### Si es un repositorio nuevo:

1. **Crear el repositorio** en GitHub/GitLab (vacío, sin README)

2. **Agregar como segundo remoto:**
   ```bash
   git remote add otro https://github.com/usuario/nuevo-repositorio.git
   ```

3. **Verificar:**
   ```bash
   git remote -v
   ```

4. **Subir:**
   ```bash
   git push otro sqlite-native
   ```

5. **Si necesitas crear una rama nueva en el otro repo:**
   ```bash
   git push otro sqlite-native:main
   # Esto crea la rama "main" en "otro" con el contenido de "sqlite-native"
   ```

---

## 🔍 Comandos Útiles

### Ver todos los remotos:
```bash
git remote -v
```

### Ver información de un remoto:
```bash
git remote show otro
```

### Eliminar un remoto:
```bash
git remote remove otro
```

### Cambiar nombre de un remoto:
```bash
git remote rename otro nuevo-nombre
```

---

## ⚠️ Notas Importantes

1. **Primera vez en repositorio nuevo:**
   - Si el repositorio está vacío, puedes usar:
     ```bash
     git push otro sqlite-native:main
     ```
   - Esto crea la rama "main" en el nuevo repo

2. **Repositorio con contenido:**
   - Si el nuevo repo ya tiene contenido, primero haz pull:
     ```bash
     git pull otro main --allow-unrelated-histories
     ```

3. **Autenticación:**
   - Puede pedirte usuario/contraseña o token
   - Para GitHub: Usa Personal Access Token en lugar de contraseña

---

## 📝 Ejemplo Completo

```bash
# 1. Ver remotos actuales
git remote -v

# 2. Agregar nuevo remoto
git remote add universidad https://github.com/universidad/jardin-botanico.git

# 3. Verificar
git remote -v

# 4. Subir al nuevo repositorio
git push universidad sqlite-native

# 5. (Opcional) Crear rama "main" en el nuevo repo
git push universidad sqlite-native:main
```

---

## 🔐 Autenticación

Si pide autenticación:
- **GitHub:** Usa Personal Access Token (no contraseña)
- **GitLab:** Usa token de acceso personal
- **Servidor propio:** SSH o credenciales del servidor

Para crear token en GitHub:
1. Settings → Developer settings → Personal access tokens
2. Generate new token
3. Usa el token como contraseña


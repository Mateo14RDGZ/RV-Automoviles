# 📤 Instrucciones para Subir el Código a GitHub

## ⚠️ Problema de Autenticación

Git está intentando usar credenciales de `rfstudiodigital` pero necesitas autenticarte como `Mateo14RDGZ`.

## 🔐 Solución: Usar Personal Access Token (Recomendado)

### Paso 1: Crear un Personal Access Token en GitHub

1. Ve a: https://github.com/settings/tokens
2. Haz clic en **"Generate new token"** > **"Generate new token (classic)"**
3. Configura:
   - **Note**: `RV-Automoviles Deploy`
   - **Expiration**: Elige una fecha (o "No expiration" si prefieres)
   - **Scopes**: Marca `repo` (esto da acceso completo a repositorios)
4. Haz clic en **"Generate token"**
5. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)
   - Ejemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 2: Usar el Token para Hacer Push

**Opción A: Usar el token en la URL (temporal)**

```bash
cd "C:\Users\poron\OneDrive\Desktop\RV Automo\QuesadaAutomoviles"

# Reemplaza TU_TOKEN con el token que copiaste
git remote set-url origin https://TU_TOKEN@github.com/Mateo14RDGZ/RV-Automoviles.git

git push -u origin main
```

**Opción B: Usar el token cuando Git lo pida**

```bash
cd "C:\Users\poron\OneDrive\Desktop\RV Automo\QuesadaAutomoviles"

# Cuando Git pida usuario y contraseña:
# Username: Mateo14RDGZ
# Password: [pega tu Personal Access Token aquí]
git push -u origin main
```

### Paso 3: Guardar el Token (Opcional pero Recomendado)

Para no tener que ingresar el token cada vez:

1. Instala **Git Credential Manager** si no lo tienes:
   ```bash
   winget install Git.Git
   ```

2. O configura Git para usar el token:
   ```bash
   git config --global credential.helper manager-core
   ```

3. La próxima vez que hagas push, Git guardará el token automáticamente

## 🔄 Alternativa: Usar SSH

### Paso 1: Generar Clave SSH (si no tienes una)

```bash
ssh-keygen -t ed25519 -C "tu-email@example.com"
```

### Paso 2: Agregar la Clave a GitHub

1. Copia tu clave pública:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Ve a: https://github.com/settings/keys
3. Haz clic en **"New SSH key"**
4. Pega la clave y guarda

### Paso 3: Cambiar Remote a SSH

```bash
cd "C:\Users\poron\OneDrive\Desktop\RV Automo\QuesadaAutomoviles"
git remote set-url origin git@github.com:Mateo14RDGZ/RV-Automoviles.git
git push -u origin main
```

## ✅ Verificar que Funcionó

Después del push exitoso, verifica en:
https://github.com/Mateo14RDGZ/RV-Automoviles

Deberías ver todos los archivos del proyecto.

## 🆘 Si Sigue Fallando

1. **Verifica que tengas acceso al repositorio**:
   - Ve a: https://github.com/Mateo14RDGZ/RV-Automoviles
   - Asegúrate de estar logueado como `Mateo14RDGZ`

2. **Verifica el remote**:
   ```bash
   git remote -v
   ```
   Debe mostrar: `https://github.com/Mateo14RDGZ/RV-Automoviles.git`

3. **Limpia todas las credenciales**:
   ```bash
   cmdkey /list
   # Elimina todas las entradas relacionadas con GitHub
   cmdkey /delete:LegacyGeneric:target=git:https://github.com
   ```

4. **Intenta de nuevo con el token**

---

**Nota**: El Personal Access Token es la forma más segura y recomendada para autenticarse con GitHub desde la línea de comandos.

# Guía para hacer commit en GitHub

Aquí están los comandos necesarios para hacer commit de tus cambios en GitHub:

## Pasos para hacer commit

1. **Verificar los cambios realizados**
   ```bash
   git status
   ```

2. **Añadir todos los archivos modificados al área de preparación**
   ```bash
   git add .
   ```

3. **Hacer commit de los cambios con un mensaje descriptivo**
   ```bash
   git commit -m "Preparar aplicación para versión beta 0.0.1"
   ```

4. **Subir los cambios al repositorio remoto**
   ```bash
   git push origin main
   ```

## Comandos adicionales útiles

- **Ver el historial de commits**
  ```bash
  git log
  ```

- **Ver los cambios que se van a commit**
  ```bash
  git diff --cached
  ```

- **Deshacer el último commit (pero mantener los cambios)**
  ```bash
  git reset --soft HEAD~1
  ```

- **Deshacer el último commit y los cambios**
  ```bash
  git reset --hard HEAD~1
  ```

## Recomendaciones para mensajes de commit

- Usa el tiempo presente: "Añade función" en lugar de "Añadí función"
- Sé breve pero descriptivo (máximo 50 caracteres para el título)
- Si necesitas más detalles, añade una línea en blanco y luego una descripción más larga

Ejemplo:
```
Añade documentación para despliegue

Se ha creado un README.md con instrucciones claras para el despliegue en Vercel,
un archivo .env.local con todas las variables de entorno necesarias y un
archivo VERIFICATION.md con una lista de verificación detallada.
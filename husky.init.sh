#!/bin/bash

echo "🧪 Inicializando configuración de Husky, lint-staged, ESLint y Prettier..."

# 1. Instalar Husky
npx husky install
echo "✅ Husky instalado"

# 2. Crear carpeta .husky si no existe
mkdir -p .husky

# 3. Crear hook pre-commit
cat <<'EOF' > .husky/pre-commit
#!/bin/sh
node ./scripts/lint.js
EOF

chmod +x .husky/pre-commit
echo "✅ Hook pre-commit creado"

echo "✅ Configuración completada con éxito. Verificá que tengas 'lint-staged' y las reglas en tu package.json."
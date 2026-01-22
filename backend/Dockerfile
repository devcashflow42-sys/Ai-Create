FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Copiar código
COPY . .

# Puerto
EXPOSE 8001

# Comando de inicio
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]

FROM node:20-slim

# IfcConvert CLI のインストール
# IfcOpenShell v0.8.1 Linux x86_64
# TODO: リリースURLはビルド時に確認・更新すること
#       https://github.com/IfcOpenShell/IfcOpenShell/releases
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget unzip ca-certificates && \
    wget -q -O /tmp/ifcopenshell.zip \
      "https://s3.amazonaws.com/ifcopenshell-builds/IfcConvert-v0.8.5-a51b2c5-linux64.zip" && \
    unzip /tmp/ifcopenshell.zip -d /tmp/ifcconvert && \
    cp /tmp/ifcconvert/IfcConvert /usr/local/bin/IfcConvert && \
    chmod +x /usr/local/bin/IfcConvert && \
    rm -rf /tmp/ifcopenshell.zip /tmp/ifcconvert && \
    apt-get purge -y wget unzip && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# IfcConvert の動作確認
RUN IfcConvert --help || echo "WARNING: IfcConvert --help failed. URL/バイナリを確認してください。"

WORKDIR /app

# 依存インストール
COPY package*.json ./
RUN npm ci

# ソースコードのビルド
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

EXPOSE 3001

CMD ["node", "dist/index.js"]

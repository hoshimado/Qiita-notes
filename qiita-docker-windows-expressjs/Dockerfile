FROM node:16-alpine3.16


# アプリケーションディレクトリを作成する
WORKDIR /usr/src/app


# アプリケーションの依存関係をインストールする
# ワイルドカードを使用して、package.json と package-lock.json の両方が確実にコピーされるようにします。
# 可能であれば (npm@5+)
COPY package*.json ./


# 本番用に必要なモジュールのみインストール
RUN npm install --production


# アプリケーションのソースをバンドルする
COPY server.js ./
COPY ./src/ ./src/


EXPOSE 3000
CMD [ "node", "server.js" ]



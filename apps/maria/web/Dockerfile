ARG REGISTRY=
FROM ${REGISTRY}python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir flask==3.0.3 pymysql==1.1.1 cryptography==42.0.8
COPY . /app
EXPOSE 5000
CMD ["python", "app.py"]

ARG REGISTRY=
FROM ${REGISTRY}python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir flask==3.0.3 pymssql
COPY . /app
EXPOSE 5000
CMD ["python", "app.py"]

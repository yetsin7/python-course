FROM python:3.13-slim
WORKDIR /app
COPY requirements-lock.txt .
RUN python -m pip install --no-cache-dir -r requirements-lock.txt
COPY domain.py storage.py application.py ./
RUN mkdir -p /app/build && useradd --uid 10001 --create-home learner && chown learner /app/build
USER learner
EXPOSE 8017
CMD ["python", "-m", "uvicorn", "application:app", "--host", "0.0.0.0", "--port", "8017"]

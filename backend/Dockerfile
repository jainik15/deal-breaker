# Use a Python base image (slim is ideal for smaller deployment size)
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the dependency files first (optimizes Docker caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY app/ ./app/

# Command to run the application using Uvicorn
# We set the host to 0.0.0.0 for external access and use the default port 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
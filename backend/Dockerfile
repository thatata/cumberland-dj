# Pull python 3.7 container
FROM python:3.7-slim

# Set working directory
WORKDIR /app

# copy source files
ADD . /app

# install dependencies
RUN pip install -r requirements.txt

CMD python -m flask run --host=0.0.0.0

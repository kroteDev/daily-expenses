FROM ruby:3.4-slim

RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y \
  build-essential \
  git \
  curl \
  nano \
  libpq-dev \
  libvips \
  libjemalloc2 && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]

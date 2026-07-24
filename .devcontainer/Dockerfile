FROM mcr.microsoft.com/devcontainers/go:2-1.26-trixie

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends xclip curl git

# Install templ CLI
RUN su vscode -c "go install github.com/a-h/templ/cmd/templ@latest" \
    && (cp /go/bin/templ /usr/local/bin/templ 2>/dev/null || true)

# Install Antigravity CLI (agy)
RUN su vscode -c "curl -fsSL https://antigravity.google/cli/install.sh | bash"
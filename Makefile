.DEFAULT_GOAL := help

NPM ?= npm
SSH ?= ssh
SCP ?= scp

-include deploy.mk

DEPLOY_SSH ?=
DEPLOY_PORT ?= 22
DEPLOY_PATH ?=

export DEPLOY_SSH DEPLOY_PORT DEPLOY_PATH

.PHONY: help install dev build setup-deploy deploy upload check-node check-deploy

help: ## Mavjud buyruqlarni ko‘rsatish
	@awk 'BEGIN {FS = ":.*## "; print "Buyruqlar:"} /^[[:alnum:]_-]+:.*## / {printf "  make %-16s %s\n", $$1, $$2}' Makefile

check-node:
	@node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (!((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22)) { console.error("Node.js 20.19+ yoki 22.12+ kerak. Avval nvm use qiling."); process.exit(1); }'

install: check-node ## Kutubxonalarni lock fayl bo‘yicha o‘rnatish
	$(NPM) ci

dev: check-node ## Frontendni lokal ishga tushirish
	$(NPM) run dev

build: check-node ## Frontendni dist/ papkasiga build qilish
	$(NPM) run build

setup-deploy: ## deploy.mk sozlama faylini yaratish
	@if [ -e deploy.mk ]; then \
		printf '%s\n' 'deploy.mk mavjud. Sozlamalar saqlandi.'; \
	else \
		cp deploy.example.mk deploy.mk; \
		printf '%s\n' 'deploy.mk yaratildi. DEPLOY_SSH va DEPLOY_PATH qiymatlarini to‘ldiring.'; \
	fi

check-deploy:
	@set -eu; \
	case "$$DEPLOY_SSH" in \
		''|-*|*[!a-zA-Z0-9_.@-]*) printf '%s\n' 'DEPLOY_SSH ni user@host yoki SSH alias ko‘rinishida yozing.' >&2; exit 1 ;; \
	esac; \
	case "$$DEPLOY_PORT" in \
		''|*[!0-9]*|??????*) printf '%s\n' 'DEPLOY_PORT 1–65535 oralig‘idagi son bo‘lishi kerak.' >&2; exit 1 ;; \
	esac; \
	if [ "$$DEPLOY_PORT" -lt 1 ] || [ "$$DEPLOY_PORT" -gt 65535 ]; then \
		printf '%s\n' 'DEPLOY_PORT 1–65535 oralig‘ida bo‘lishi kerak.' >&2; exit 1; \
	fi; \
	case "$$DEPLOY_PATH" in \
		/*) ;; \
		*) printf '%s\n' 'DEPLOY_PATH serverdagi to‘liq papka yo‘li bo‘lishi kerak.' >&2; exit 1 ;; \
	esac; \
	case "$$DEPLOY_PATH" in \
		/|*[!a-zA-Z0-9_./-]*) printf '%s\n' 'DEPLOY_PATH uchun alohida frontend papkasini yozing; bo‘shliq ishlatmang.' >&2; exit 1 ;; \
	esac; \
	case "$$DEPLOY_PATH" in \
		*[!/]*) ;; \
		*) printf '%s\n' 'DEPLOY_PATH ildiz papka bo‘lmasligi kerak.' >&2; exit 1 ;; \
	esac; \
	case "/$$DEPLOY_PATH/" in \
		*/../*|*/./*) printf '%s\n' 'DEPLOY_PATH ichida . yoki .. bo‘lmasin.' >&2; exit 1 ;; \
	esac; \
	command -v "$(SSH)" >/dev/null; \
	command -v "$(SCP)" >/dev/null

deploy: check-deploy ## Build qilib, serverga yuklash
	$(MAKE) build
	$(MAKE) upload

upload: check-deploy ## Mavjud dist/ buildini serverga yuklash
	@set -eu; \
	if [ ! -s dist/index.html ] || [ ! -d dist/assets ]; then \
		printf '%s\n' 'Tayyor build topilmadi. Avval make build qiling.' >&2; exit 1; \
	fi; \
	printf 'Yuklanmoqda: %s:%s\n' "$$DEPLOY_SSH" "$$DEPLOY_PATH"; \
	$(SSH) -p "$$DEPLOY_PORT" "$$DEPLOY_SSH" "mkdir -p '$$DEPLOY_PATH' && test -w '$$DEPLOY_PATH'"; \
	for artifact in dist/*; do \
		[ "$$artifact" != dist/index.html ] || continue; \
		$(SCP) -r -P "$$DEPLOY_PORT" "$$artifact" "$$DEPLOY_SSH:$$DEPLOY_PATH/"; \
	done; \
	$(SCP) -P "$$DEPLOY_PORT" dist/index.html "$$DEPLOY_SSH:$$DEPLOY_PATH/.index.html.upload"; \
	$(SSH) -p "$$DEPLOY_PORT" "$$DEPLOY_SSH" "mv -f '$$DEPLOY_PATH/.index.html.upload' '$$DEPLOY_PATH/index.html'"; \
	printf '%s\n' 'Frontend serverga yuklandi.'

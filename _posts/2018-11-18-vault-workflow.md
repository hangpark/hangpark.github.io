---
title: Vault Workflow
tags:
  - vault
---

# Vault 설치하기

## v1.0.0-beta2

```sh
# Go 설치
$ brew install go
$ echo 'export GOPATH={Go 프로젝트들의 base path로 잡을 경로}' >> ~/.zshrc
$ echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.zshrc
$ source ~/.zshrc

# Vault 빌드
$ git clone https://github.com/hashicorp/vault.git $GOPATH/src/github.com/hashicorp/vault
$ cd !$
$ git checkout v1.0.0-beta2
$ go get github.com/mitchellh/gox
$ make

# Vault 설치 체크
$ vault -v
Vault v1.0.0-beta2 ('8f61c4953620801477ad40f9d75063659acb5d84')
```

# Vault 인증하기

## GitHub

https://github.com/settings/tokens

`read:org` 권한 personal access token을 생성한다.

`VAULT_AUTH_GITHUB_TOKEN`으로 환경변수화 시켜도 된다.


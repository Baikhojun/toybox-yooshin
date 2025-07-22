# Ubuntu 환경에서 Git 및 GitHub 설정 가이드

이 문서는 Ubuntu Linux 환경에서 Git을 설치하고 GitHub와 연동하는 전체 과정을 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [Git 설치 및 확인](#git-설치-및-확인)
3. [Git 사용자 정보 설정](#git-사용자-정보-설정)
4. [SSH 서비스 설정](#ssh-서비스-설정)
5. [SSH 키 생성](#ssh-키-생성)
6. [GitHub에 SSH 키 등록](#github에-ssh-키-등록)
7. [SSH 연결 테스트](#ssh-연결-테스트)
8. [저장소 클론](#저장소-클론)

## 사전 준비

- Ubuntu Linux 환경 (이 가이드는 Ubuntu 22.04 이상에서 테스트됨)
- 인터넷 연결
- GitHub 계정

## Git 설치 및 확인

### 1. Git 설치 상태 확인

먼저 시스템에 Git이 설치되어 있는지 확인합니다:

```bash
git --version
```

출력 예시:
```
git version 2.43.0
```

### 2. Git이 설치되어 있지 않은 경우

```bash
sudo apt update
sudo apt install git
```

## Git 사용자 정보 설정

Git 커밋에 사용될 사용자 이름과 이메일을 설정합니다:

```bash
git config --global user.name "Baikhojun"
git config --global user.email "qorghwns90@naver.com"
```

설정 확인:
```bash
git config --global --list | grep -E "user\.(name|email)"
```

출력 예시:
```
user.name=Baikhojun
user.email=qorghwns90@naver.com
```

## SSH 서비스 설정

Ubuntu에서 SSH 서비스가 활성화되어 있는지 확인하고 필요시 활성화합니다:

### 1. SSH 서비스 시작

```bash
sudo systemctl start ssh
```

### 2. SSH 서비스 상태 확인

```bash
sudo systemctl status ssh
```

### 3. SSH 서비스 재시작 (필요시)

```bash
sudo systemctl restart ssh
```

### 4. 방화벽에서 SSH 허용

```bash
sudo ufw allow ssh
```

### 5. SSH 설정 확인/수정 (필요시)

```bash
sudo vi /etc/ssh/sshd_config
```

## SSH 키 생성

### 1. 기존 SSH 키 확인

```bash
ls -la ~/.ssh | grep -E "(id_rsa|id_ed25519)"
```

### 2. 새 SSH 키 생성

Ed25519 알고리즘을 사용하여 SSH 키 쌍을 생성합니다:

```bash
ssh-keygen -t ed25519 -C "qorghwns90@naver.com" -f ~/.ssh/id_ed25519 -N ""
```

**참고**: `-N ""` 옵션은 패스프레이즈 없이 키를 생성합니다. 보안을 위해 패스프레이즈를 설정하려면 이 옵션을 제거하고 대화형으로 입력하세요.

### 3. 생성된 공개 키 확인

```bash
cat ~/.ssh/id_ed25519.pub
```

출력 예시:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOg+X0rtmAs0ZOA4WKfYx8xqf1E4XOis6YjwpLbbENX2 qorghwns90@naver.com
```

## GitHub에 SSH 키 등록

1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 프로필 아이콘 클릭 → **Settings**
3. 좌측 메뉴에서 **SSH and GPG keys** 클릭
4. **New SSH key** 버튼 클릭
5. 다음 정보 입력:
   - **Title**: "Linux PC" (또는 원하는 식별 가능한 이름)
   - **Key**: 위에서 확인한 공개 키 전체를 복사하여 붙여넣기
6. **Add SSH key** 버튼 클릭

## SSH 연결 테스트

### 1. GitHub를 known hosts에 추가

```bash
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
```

### 2. SSH 연결 테스트

```bash
ssh -T git@github.com
```

성공 시 출력 예시:
```
Hi Baikhojun! You've successfully authenticated, but GitHub does not provide shell access.
```

**참고**: 위 메시지는 정상적인 응답입니다. GitHub는 셸 접근을 제공하지 않지만, Git 작업은 가능합니다.

## 저장소 클론

### 1. HTTPS로 클론 (공개 저장소)

```bash
git clone https://github.com/isnbh0/toybox-template.git
```

### 2. SSH로 클론 (권한이 있는 저장소)

```bash
git clone git@github.com:username/repository-name.git
```

### 3. 클론된 저장소 확인

```bash
cd toybox-template
ls -la
```

## 추가 팁

### 새 저장소 생성 및 GitHub 연결

```bash
mkdir my-project
cd my-project
git init
git remote add origin git@github.com:Baikhojun/my-project.git
```

### 자주 사용하는 Git 명령어

```bash
# 상태 확인
git status

# 변경사항 추가
git add .

# 커밋
git commit -m "커밋 메시지"

# 푸시
git push origin main
```

## 문제 해결

### SSH 연결 실패 시

1. SSH 에이전트가 실행 중인지 확인:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

2. 권한 확인:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/id_ed25519
   chmod 644 ~/.ssh/id_ed25519.pub
   ```

3. SSH 디버그 모드로 연결:
   ```bash
   ssh -vT git@github.com
   ```

### Git 푸시 권한 오류 시

원격 저장소 URL이 SSH 형식인지 확인:
```bash
git remote -v
```

HTTPS에서 SSH로 변경:
```bash
git remote set-url origin git@github.com:username/repository-name.git
```

---

이 가이드를 따라 설정하면 Ubuntu 환경에서 Git과 GitHub를 성공적으로 사용할 수 있습니다.
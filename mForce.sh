#!/bin/bash
# mForce.sh - Standard Automation Script

# --- COLOR PALETTE (Space Theme) ---
NEON='\033[1;36m'   # Bright Cyan (The Laser)
BLUE='\033[1;34m'   # Bold Blue (The OS)
DEEP='\033[0;34m'   # Dark Blue (The Void)
STAR='\033[1;37m'   # White (The Stars)
RED='\033[0;31m'    # Error Red
NC='\033[0m'        # Reset

# --- DEBUGGING ---
DEBUG=${DEBUG:-false}

log_debug() {
    if [ "$DEBUG" = true ]; then
        printf "${DEEP}[DEBUG] %s${NC}\n" "$1"
    fi
}

log_info() {
    printf "${STAR}[INFO] %s${NC}\n" "$1"
}

log_success() {
    printf "${NEON}[SUCCESS] %s${NC}\n" "$1"
}

log_error() {
    printf "${RED}[ERROR] %s${NC}\n" "$1"
}

log_warn() {
    printf "\033[1;33m[WARN] %s${NC}\n" "$1"
}

# --- HEADER ART ---
print_header() {
    echo -e "${DEEP}   .     +      * .      *${NC}"
    echo -e "                                      ${BLUE}___  ___${NC}"
    echo -e "${NEON}  __ _            _          ${BLUE}/ _ \/ __|${NC}"
    echo -e "${NEON} / _| |_   ___  _(_)_   _____${BLUE}| (_) \__ \\\\${NC}"
    echo -e "${STAR}| |_| | | | \ \/ / \ \ / / _ \\${BLUE}\___/|___/${NC}"
    echo -e "${DEEP}|  _| | |_| |>  <| |\ V /  __/   ${NC}"
    echo -e "${DEEP}|_| |_|\__,_/_/\_\_| \_/ \___|   ${NC}"
    echo -e ""
    echo -e "${DEEP} ----------------------------------------${NC}"
}

# --- CONFIGURATION ---
PROJECT_NAME="mForceLibrary"
PROJECT_DIR="$(pwd)"
DATE=$(date +%Y%m%d_%H%M%S)

# GCP Configuration
GCP_PROJECT="mforcelibrary"

# --- FUNCTIONS ---

# 0. Info
cmd_info() {
    print_header
    log_info "Project Info Cache:"
    echo -e "  ${NEON}Name:${NC} $PROJECT_NAME"
    echo -e "  ${NEON}GCP Project:${NC} $GCP_PROJECT"
    echo -e "  ${NEON}Directory:${NC} $PROJECT_DIR"
    echo -e "  ${NEON}Date:${NC} $DATE"
    echo -e "  ${NEON}Debug Mode:${NC} $DEBUG"
    
    log_debug "Environment Variables:"
    env | grep -E "PROJECT|GCP|PATH" | head -n 5
    echo ""
}

# 1. Doc
cmd_doc() {
    log_info "Synchronizing Documentation Hub..."
    DOC_FILE="mForceLibrary.md"
    VITEPRESS_DOC="docs/library.md"
    
    log_debug "Source: $DOC_FILE -> Target: $VITEPRESS_DOC"
    
    if [ -f "$DOC_FILE" ]; then
        # Mirror the meta-doc into the VitePress structure
        cp "$DOC_FILE" "$VITEPRESS_DOC"
        log_debug "Updating generation metadata in $DOC_FILE"
        echo -e "\n---\n**Last Sync:** $DATE" >> "$DOC_FILE"
        log_success "Internal documentation mirrored to VitePress."
    else
        log_warn "Meta-doc $DOC_FILE not found. Skipping mirror."
    fi
}

# 2. Status
cmd_status() {
    log_info "Inspecting Intelligence Ecosystem..."
    log_debug "Running: git status --short"
    git status -s
    
    log_debug "Checking VitePress Health..."
    if [ -d "docs/.vitepress/dist" ]; then
        log_info "Build artifacts found in docs/.vitepress/dist"
    fi
}

# 3. Checkout
cmd_checkout() {
    log_info "Pulling Remote Intelligence (Git Pull)..."
    git pull || { log_error "Pull failed."; exit 1; }
    log_success "Ecosystem synchronized with main branch."
}

# 4. Checkin
cmd_checkin() {
    log_info "Submitting Intel to Remote (Git Push)..."
    read -p "Enter Intelligence Log (Commit Msg): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Ecosystem Intelligence Update $DATE"}
    
    git add .
    git commit -m "$COMMIT_MSG" || log_info "No new intelligence to commit."
    git push || { log_error "Push failed."; exit 1; }
    log_success "Ecosystem state pushed to remote."
}

# 5. Build
cmd_build() {
    log_info "Compiling Documentation Ecosystem (VitePress Build)..."
    
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vitepress" ]; then
        log_warn "Dependencies missing. Attempting install..."
        export npm_config_cache=/tmp/npm-cache && npm install
    fi

    npm run docs:build || {
        log_warn "Standard build failed. Trying npx build..."
        export npm_config_cache=/tmp/npm-cache && npx -y vitepress@1.3.4 build docs
    }
    log_success "Ecosystem compiled successfully."
}

# 6. Test
cmd_test() {
    log_info "Initializing Unified Information Hub (Docs Dev)..."
    
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vitepress" ]; then
        log_warn "Dependencies appear missing or corrupted."
        log_info "Attempting local repair..."
        export npm_config_cache=/tmp/npm-cache && npm install
    fi

    log_debug "Executing: npm run docs:dev"
    npm run docs:dev || {
        log_warn "Standard 'npm run' failed. Trying direct npx execution..."
        export npm_config_cache=/tmp/npm-cache && npx -y vitepress@1.3.4 dev docs
    }
}

# 7. Deploy
cmd_deploy() {
    log_info "Launching Mission to Google Cloud..."
    
    if [ -f "cloudbuild.yaml" ]; then
        log_info "Submitting build to $GCP_PROJECT..."
        gcloud beta builds submit --project "$GCP_PROJECT" --config cloudbuild.yaml .
    else
        log_error "Critical Error: cloudbuild.yaml missing."
    fi
}

# 8. Clean
cmd_clean() {
    log_info "Purging Temporary Artifacts..."
    rm -rf docs/.vitepress/dist docs/.vitepress/cache node_modules/.vitepress
    rm -rf *.log *.tmp backup_*.tar.gz
    log_success "Workspace purged."
}

# 9. Sync (New)
cmd_sync() {
    log_info "Performing Full Ecosystem Sync..."
    cmd_doc
    cmd_checkout
    cmd_status
}

# 10. Debug
cmd_debug() {
    log_info "Activating High-Verbosity Debug Mode..."
    export DEBUG=true
    cmd_info
}

# 420. Bake
cmd_bake() {
    log_info "🔥🔥🔥 BAKING ECOSYSTEM (Full Mission Cycle) 🔥🔥🔥"
    cmd_doc
    cmd_build
    cmd_checkin
    cmd_deploy
    log_success "PROJECT BAKED & DEPLOYED."
}

# --- MAIN MENU ---
if [ "$1" ]; then
    CMD=$1
else
    print_header
    echo -e "Unified mForce Interface [DEBUG=$DEBUG]:"
    echo " [1] Doc Sync         [6] Test (Dev)"
    echo " [2] Status Check     [7] Deploy (GCP)"
    echo " [3] Pull Intel       [8] Purge Space"
    echo " [4] Push Intel       [9] Ecosystem Sync"
    echo " [5] Build Docs       [10] Debug Mode"
    echo " ---------------------------------------"
    echo " [420] THE FULL BAKE (Build + Push + Deploy)"
    read -p "Command sequence: " CMD
fi

case $CMD in
    1|doc) cmd_doc ;;
    2|status) cmd_status ;;
    3|pull|checkout) cmd_checkout ;;
    4|push|checkin) cmd_checkin ;;
    5|build) cmd_build ;;
    6|test|dev) cmd_test ;;
    7|deploy) cmd_deploy ;;
    8|clean|purge) cmd_clean ;;
    9|sync) cmd_sync ;;
    10|debug) cmd_debug ;;
    420|bake) cmd_bake ;;
    info|0) cmd_info ;;
    *) log_error "Invalid Sequence: $CMD" ;;
esac

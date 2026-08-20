import { ref } from 'vue'

// Global state for operations console
const isLibrarianOpen = ref(false)

export function useLibrarian() {
    
    // Command parser logic
    const processCommand = (cmdString) => {
        if (!cmdString) return { type: 'error', msg: 'No command.' }
        
        const raw = cmdString.trim().toLowerCase()
        const parts = raw.split(/\s+/)
        const cmd = parts[1] || '' // assuming 'cmd <action>'
        
        // Check valid commands
        if (raw.startsWith('cmd')) {
            if (['librarian', 'admin', 'login', 'lib'].includes(cmd)) {
                return { type: 'action', action: 'open_librarian', msg: 'ACCESS GRANTED' }
            }
            if (cmd === 'info') {
                 return { type: 'info', msg: 'SYSTEM VERSION 1.0.0' }
            }
            return { type: 'error', msg: `UNKNOWN COMMAND: ${cmd}` }
        }
        
        return { type: 'none' }
    }

    const openLibrarian = () => {
        isLibrarianOpen.value = true
    }

    const closeLibrarian = () => {
        isLibrarianOpen.value = false
    }

    return {
        isLibrarianOpen,
        openLibrarian,
        closeLibrarian,
        processCommand
    }
}

type User = {
    id?: number
    displayName: string
    email: string
    photoURL: string
}

type AuthState = {
    auth: User | null
}

type AuthActions = {
    setAuth: (auth: User | null) => void
}
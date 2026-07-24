const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase())
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const getGravatarUrl = async (email: string, size: number = 120): Promise<string> => {
    if (!email) return `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=${size}`;
    const hash = await sha256(email);
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}
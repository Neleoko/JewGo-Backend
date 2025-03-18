export default function getFirebaseErrorMessage(errorCode: string): { message: string, statusCode: number } {
    switch (errorCode) {
        case 'auth/invalid-credential':
            return {
                message: "Les identifiants sont incorrect",
                statusCode: 400
            };
        case 'auth/invalid-email':
            return {
                message: "L'adresse e-mail est invalide",
                statusCode: 400
            };
        case 'auth/user-not-found':
            return {
                message: "Utilisateur non trouvé",
                statusCode: 404
            };
        case 'auth/email-already-in-use':
            return {
                message: "L'adresse e-mail est déjà utilisée",
                statusCode: 400
            };
        case 'auth/weak-password':
            return {
                message: "Le mot de passe est trop faible",
                statusCode: 400
            };
        case 'auth/too-many-requests':
            return {
                message: "Trop de tentatives de connexion. Veuillez réessayer plus tard",
                statusCode: 429
            };
        default:
            return {
                message: "Une erreur est survenue. Veuillez réessayer",
                statusCode: 500
            };
    }
}
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from '@tanstack/react-router'

/**
 * User-friendly error component that displays errors in a clean, understandable way
 * @param {Object} props
 * @param {Error} props.error - The error object
 * @param {Function} props.reset - Optional reset function to retry
 * @param {boolean} props.showTechnicalDetails - Whether to show technical stack trace (default: false in production)
 */
export default function ErrorComponent({ error, reset, showTechnicalDetails = false }) {
    const isDevelopment = import.meta.env.DEV
    const shouldShowTechnical = showTechnicalDetails || isDevelopment

    // Determine if this is a user-friendly error message or a technical one
    const isUserFriendlyError = error?.message && !error.message.includes('at ') && error.message.length < 200

    const errorMessage = error?.message || 'An unexpected error occurred'
    const errorTitle = isUserFriendlyError ? 'Something went wrong' : 'Error'

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{errorTitle}</h1>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            {errorMessage}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mb-6">
                    {reset && (
                        <button
                            onClick={reset}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    )}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Go to Home
                    </Link>
                </div>

                {shouldShowTechnical && error?.stack && (
                    <details className="mt-6">
                        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 mb-2">
                            Technical Details (for developers)
                        </summary>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto">
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                                {error.stack}
                            </pre>
                        </div>
                    </details>
                )}
            </div>
        </div>
    )
}

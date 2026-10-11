import { useSandpack } from '@codesandbox/sandpack-react'
import React, { useEffect } from 'react'

function classifyPreviewError(error) {
    const message = String(error?.message || error?.title || error?.error || 'Preview reported an unspecified error')
    const details = `${message} ${error?.stack || ''} ${error?.path || ''}`.toLowerCase()

    const networkSignals = [
        'failed to fetch',
        'networkerror',
        'err_connection',
        'err_timed_out',
        'err_name_not_resolved',
        'col.csbops.io',
        'sandpack bundler',
        'websocket is closed',
        'load failed',
        'fetch failed',
    ]

    if (networkSignals.some((signal) => details.includes(signal))) {
        return {
            type: 'network',
            label: 'Preview connection issue',
            message,
            path: error?.path || null,
            fixable: false,
            guidance: 'The preview service or network connection appears unavailable. Check your connection and retry the preview; changing generated code may not help.',
        }
    }

    const dependencySignals = [
        'cannot find module',
        'module not found',
        'could not resolve',
        'failed to resolve import',
        'package not found',
        'is not exported from',
        'does not provide an export named',
    ]

    if (dependencySignals.some((signal) => details.includes(signal))) {
        return {
            type: 'dependency',
            label: 'Import or dependency error',
            message,
            path: error?.path || null,
            fixable: true,
            guidance: 'The project may reference a missing package, file, or export. Auto-Fix can try to correct the generated code.',
        }
    }

    const codeSignals = [
        'syntaxerror',
        'typeerror',
        'referenceerror',
        'compilation',
        'compile error',
        'unexpected token',
        'is not defined',
        'invalid hook call',
    ]

    if (codeSignals.some((signal) => details.includes(signal))) {
        return {
            type: 'code',
            label: 'Code error',
            message,
            path: error?.path || null,
            fixable: true,
            guidance: 'Auto-Fix can ask the AI to address this code error.',
        }
    }

    return {
        type: 'unknown',
        label: 'Preview error',
        message,
        path: error?.path || null,
        fixable: false,
        guidance: 'The preview reported an error that could not be safely classified. Check the preview service and error details before asking the AI to change code.',
    }
}

const SandpackErrorMonitor = ({ onErrorChange, onActiveError }) => {
    const { sandpack } = useSandpack()
    const { error } = sandpack

    useEffect(() => {
        if (!error) {
            onErrorChange?.(true)
            onActiveError?.(null)
            return
        }

        const classifiedError = classifyPreviewError(error)
        onErrorChange?.(classifiedError.type !== 'network')
        onActiveError?.(classifiedError)
    }, [error, onErrorChange, onActiveError])

    return null
}

export default SandpackErrorMonitor

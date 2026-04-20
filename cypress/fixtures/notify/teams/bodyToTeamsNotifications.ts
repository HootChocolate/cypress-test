export const  bodyTeamsSendMessage = () => {
    return {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "version": "1.2",
                    "msteams": {
                        "width": "Full"
                    },
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "Cypress Bot report",
                            "style": "heading"
                        },
                        {
                            "type": "CodeBlock",
                            "codeSnippet": "${MESSAGE}",
                            "language": "bash",
                            "startLineNumber": 1
                        }
                    ]
                }
            }
        ]
    }
};

export const bodyTeamsSendImage = () => {
    return {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "version": "1.2",
                    "msteams": {
                        "width": "Full"
                    },
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "${MESSAGE}"
                        },
                        {
                            "type": "Image",
                            "url": "${IMAGE}"
                        }
                    ]
                }
            }
        ]
    }
}

export const  bodyTeamsSendVideo = () => {
    return {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "version": "1.2",
                    "msteams": {
                        "width": "Full"
                    },
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "Cypress Bot report",
                            "style": "heading"
                        },
                        {
                            "type": "CodeBlock",
                            "codeSnippet": "${MESSAGE}",
                            "language": "bash",
                            "startLineNumber": 1
                        }
                    ]
                }
            }
        ]
    }
}

export default {
    bodyTeamsSendMessage,
    bodyTeamsSendImage,
    bodyTeamsSendVideo
}

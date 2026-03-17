export const logoPdf = (): string => {
    let logoSVG = `
        <style>  
            .branding {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding-top: 20px;
                border-top: 1px solid #e8ecff;
            }
            .branding svg {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }
            .branding-text {
                font-size: 0.85rem;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                letter-spacing: 0.3px;
            }
        </style>
        <div class="branding">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                <linearGradient id="g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#667eea"/>
                    <stop offset="1" stop-color="#764ba2"/>
                </linearGradient>
                </defs>
                <rect width="64" height="64" rx="16" fill="url(#g)"/>
                <rect x="10" y="14" width="44" height="42" rx="4" fill="#fff"/>
                <path d="M20 8V18" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
                <path d="M44 8V18" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
                <g stroke="#667eea" stroke-width="4" stroke-linecap="round">
                <path d="M16 30H22"/><path d="M29 30H35"/><path d="M42 30H48"/>
                <path d="M16 38H22"/><path d="M29 38H35"/><path d="M42 38H48"/>
                <path d="M16 46H22"/><path d="M29 46H35"/><path d="M42 46H48"/>
                </g>
            </svg>
            <span class="branding-text">CerimoniasPro</span>
        </div>`

    return logoSVG;
}

export const pdfGuestsAccess = (eventName: string, qrCodeUrl: string, publicUrl: string): string => {
    let pdf = 
    `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
    <meta charset="UTF-8" />
    <title>QR Code — ${eventName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #fff;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 40px 24px;
        }
        .card {
        border: 2px solid #e8ecff;
        border-radius: 20px;
        padding: 48px 40px;
        max-width: 480px;
        width: 100%;
        text-align: center;
        }
        .badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 20px;
        padding: 6px 20px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 24px;
        letter-spacing: 0.3px;
        }
        h1 {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 8px;
        line-height: 1.3;
        }
        .subtitle {
        color: #666;
        font-size: 1rem;
        margin-bottom: 32px;
        line-height: 1.5;
        }
        .qr-wrap {
        display: inline-block;
        padding: 20px;
        border: 2px solid #e8ecff;
        border-radius: 16px;
        margin-bottom: 28px;
        }
        .qr-wrap img { display: block; width: 240px; height: 240px; }
        .steps {
        text-align: left;
        background: #f5f7ff;
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 24px;
        }
        .steps h3 {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: #888;
        margin-bottom: 12px;
        font-weight: 600;
        }
        .steps ol { padding-left: 18px; }
        .steps li {
        font-size: 0.95rem;
        color: #444;
        margin-bottom: 6px;
        line-height: 1.4;
        }
        .url {
        font-size: 0.75rem;
        color: #aaa;
        word-break: break-all;
        margin-bottom: 32px;
        }
        @media print {
            @page {
                margin: 0;
            }
            body {
                padding: 2cm;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
            }
            .card { border: none; }
        }
    </style>
    </head>
    <body>
    <div class="card">
        <div class="badge">${eventName}</div>
        <h1>Encontre sua mesa</h1>
        <p class="subtitle">Escaneie o QR code abaixo e digite seu nome para descobrir em qual mesa você está.</p>
        <div class="qr-wrap">
        <img src="${qrCodeUrl}" alt="QR Code" />
        </div>
        <p class="url">${publicUrl}</p>
        <div class="steps">
        <h3>Como funciona</h3>
        <ol>
            <li>Abra a câmera do seu celular</li>
            <li>Aponte para o QR code acima</li>
            <li>Digite seu nome na busca</li>
            <li>Veja o número da sua mesa</li>
        </ol>
        </div>
        ${logoPdf()}
    </div>
    <script>window.onload = () => { window.print(); }<\/script>
    </body>
    </html>`

    return pdf;
}
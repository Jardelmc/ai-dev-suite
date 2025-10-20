const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const crypto = require('crypto');
const logger = require('../utils/logger');

const iconConfigs = [
  { size: 16, filename: 'favicon-16x16.png' },
  { size: 32, filename: 'favicon-32x32.png' },
  { size: 48, filename: 'favicon.ico', format: 'ico' },
  { size: 192, filename: 'android-chrome-192x192.png' },
  { size: 512, filename: 'android-chrome-512x512.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
  { size: 150, filename: 'mstile-150x150.png' },
];

const generateHtmlSnippet = (projectType, appName) => {
  const prefix = projectType === 'vite' ? '/' : '%PUBLIC_URL%/';
  return `
    <title>${appName}</title>
    <link rel="apple-touch-icon" sizes="180x180" href="${prefix}apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${prefix}favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${prefix}favicon-16x16.png">
    <link rel="manifest" href="${prefix}manifest.json">
    <link rel="shortcut icon" href="${prefix}favicon.ico">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-config" content="${prefix}browserconfig.xml">
    <meta name="theme-color" content="#ffffff">`;
};

const updateHtmlFile = async (htmlPath, projectType, appName) => {
  if (!(await fs.pathExists(htmlPath))) {
    throw new Error(`Arquivo index.html não encontrado em: ${htmlPath}`);
  }

  let content = await fs.readFile(htmlPath, 'utf8');

  // Remove old favicon links and title
  const oldTagsRegex = /<link rel="(shortcut icon|icon|apple-touch-icon|manifest)"[^>]*>|<meta name="(msapplication-TileColor|msapplication-config|theme-color)"[^>]*>|<title>.*<\/title>/gi;
  content = content.replace(oldTagsRegex, '');

  // Add new tags inside <head>
  const newSnippet = generateHtmlSnippet(projectType, appName);
  content = content.replace(/(<\/head>)/i, `${newSnippet}\n$1`);
  await fs.writeFile(htmlPath, content, 'utf8');
};

const generateFavicons = async (projectDir, appName, imageBase64) => {
  if (!appName || typeof appName !== 'string' || appName.trim() === '') {
    const err = new Error('Nome da aplicação é inválido ou não fornecido.');
    err.statusCode = 400;
    throw err;
  }

  const publicFolder = path.join(projectDir, 'public');
  await fs.ensureDir(publicFolder);

  const imageBuffer = Buffer.from(imageBase64, 'base64');
  const tempImagePath = path.join(os.tmpdir(), `favicon-source-${crypto.randomBytes(8).toString('hex')}.png`);
  await fs.writeFile(tempImagePath, imageBuffer);

  try {
    for (const config of iconConfigs) {
      const outputPath = path.join(publicFolder, config.filename);
      const resizer = sharp(tempImagePath).resize(config.size, config.size);
      if (config.format === 'ico') {
        await resizer.toFormat('png').toFile(outputPath);
      } else {
        await resizer.toFile(outputPath);
      }
    }

    const manifestPath = path.join(publicFolder, 'manifest.json');
    await fs.writeJson(manifestPath, {
      name: appName,
      short_name: appName,
      icons: [
        { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    }, { spaces: 2 });

    const browserConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/mstile-150x150.png"/>
            <TileColor>#ffffff</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
    await fs.writeFile(path.join(publicFolder, 'browserconfig.xml'), browserConfigContent);

    const viteConfigPath = path.join(projectDir, 'vite.config.js');
    const craIndexHtmlPath = path.join(projectDir, 'public', 'index.html');
    const viteIndexHtmlPath = path.join(projectDir, 'index.html');

    let projectType = 'react-scripts';
    let htmlPath = craIndexHtmlPath;

    if (await fs.pathExists(viteConfigPath)) {
        projectType = 'vite';
        if (await fs.pathExists(viteIndexHtmlPath)) {
            htmlPath = viteIndexHtmlPath;
        } else {
            throw new Error('Projeto Vite detectado, mas index.html não encontrado na raiz.');
        }
    } else if (!await fs.pathExists(craIndexHtmlPath)) {
        throw new Error('Não foi possível determinar o tipo do projeto ou encontrar o arquivo index.html.');
    }
    
    await updateHtmlFile(htmlPath, projectType, appName);

    return {
      success: true,
      projectType,
      message: `Favicons gerados e index.html atualizado com sucesso para projeto do tipo ${projectType}.`
    };
  } catch (error) {
    logger.error(`Erro ao gerar favicons: ${error.message}`);
    throw error;
  } finally {
    await fs.remove(tempImagePath);
  }
};

module.exports = {
  generateFavicons,
};
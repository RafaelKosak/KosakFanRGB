# Kosak Fan RGB

Aplicativo desktop desenvolvido em React e Electron para controle e gerenciamento de dispositivos ARGB (coolers, memórias RAM e placas-mãe) utilizando a biblioteca OpenRGB.

O projeto visa fornecer uma alternativa leve e direta aos softwares proprietários de fabricantes, comunicando-se com o hardware através de uma instância local embutida do OpenRGB SDK.

## Funcionalidades

- **Seletor de Cores:** Definição manual de cores via paleta HSL/Hex ou por botões de atalho com cores predefinidas.
- **Controle de Brilho:** Ajuste de intensidade dos LEDs de 0% a 100%.
- **Persistência de Estado:** Armazenamento automático da última cor e brilho aplicados, restaurando as configurações nos dispositivos ao inicializar.
- **Execução em Segundo Plano:** Minimização para a área de notificação do sistema (System Tray) ao fechar a janela.
- **Inicialização com o SO:** Opção de iniciar automaticamente junto com o Windows, incluindo suporte a inicialização oculta (direto na bandeja).

## Instalação e Uso

1. Faça o download da última versão em [Releases](https://github.com/).
2. Execute o instalador `Kosak_Fan_RGB_Setup_v1.0.0.exe`.
3. O aplicativo exige privilégios de administrador para acessar os barramentos de hardware (SMBus/LPC) e gerenciar os controladores de LED.

## Desenvolvimento Local

### Pré-requisitos
- Node.js (v18+)
- npm

### Instruções

1. Clone o repositório:
```bash
git clone https://github.com/kosak/kosak-fan-rgb.git
cd kosak-fan-rgb
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Compilar o executável de produção:
```bash
npm run build
```

O instalador gerado será salvo no diretório `./release/` sob o nome `Kosak_Fan_RGB_Setup_v1.0.0.exe`.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para obter mais informações.

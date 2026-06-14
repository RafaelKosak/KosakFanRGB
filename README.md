# Kosak Fan RGB

Aplicativo desktop desenvolvido em React e Electron para controle e gerenciamento de dispositivos ARGB (coolers, memórias RAM e placas-mãe) utilizando a biblioteca OpenRGB.

> [!NOTE]
> Este é um projeto para **uso pessoal**, distribuído para pessoas que procuram uma opção simples e leve para controlar a cor das ventoinhas (fans). O projeto está em fase **beta e desenvolvimento inicial**.
> 
> **Planejamento Futuro:** Está prevista a adição de funcionalidades para controle e configuração de **curva de velocidade das ventoinhas**.

O projeto fornece uma alternativa leve e direta aos softwares proprietários de fabricantes, comunicando-se com o hardware através de uma instância local embutida do OpenRGB SDK.

## Funcionalidades

- **Controle de Efeitos**: Modos Estático, Rainbow, Ciclo de Cores, Breathing (Respiração) e Desligado.
- **Ajustes Finos**: Controle de brilho e velocidade de animação diretamente pela interface.
- **Suporte a Dispositivos**: Integração com o serviço OpenRGB para controlar fans, coolers, placas-mãe e memórias compatíveis.
- **Seletor de Cores:** Definição de cores via picker visual, paleta de favoritas e entrada direta por código hexadecimal editável (suporta formatos de 3 e 6 dígitos).
- **Persistência de Estado:** Armazenamento automático do perfil e configurações aplicadas, restaurando o estado nos dispositivos ao inicializar.
- **Execução em Segundo Plano:** Minimização para a área de notificação do sistema (System Tray) ao fechar a janela.
- **Inicialização com o SO:** Inicia automaticamente junto com o Windows sem bloqueios de UAC (via Agendador de Tarefas do Windows), com opção de iniciar minimizado (oculto na bandeja).
- **Atualizações Automáticas**: Sistema integrado de verificação de novas versões direto pelo GitHub Releases.

## Instalação e Uso

1. Faça o download da última versão em [Releases](https://github.com/RafaelKosak/KosakFanRGB/releases).
2. Execute o instalador `Kosak_Fan_RGB_Setup_v1.0.1.exe`.
3. O aplicativo exige privilégios de administrador para acessar os barramentos de hardware (SMBus/LPC) e gerenciar os controladores de LED.

## Desenvolvimento Local

### Pré-requisitos
- Node.js (v18+)
- npm

### Instruções

1. Clone o repositório:
```bash
git clone https://github.com/RafaelKosak/KosakFanRGB.git
cd KosakFanRGB
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

O instalador gerado será salvo no diretório `./release/`.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para obter mais informações.

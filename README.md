### Projeto: Promo Plan


## Sobre o Projeto

Este projeto é um sistema de gestão para promotora de eventos que realiza degustações em supermercados. O sistema visa automatizar e centralizar o processo de gerenciamento de degustações, que atualmente é feito manualmente via WhatsApp.

## História

A cliente se trata de uma promotora de eventos, que por sua vez, promove degustações para alguns fornecedores de mercados. Atualmente ela trabalha especificamente com uma marca, mas tem o potencial de escalar isso com outros fornecedores.

Seu processo atualmente é todo gerenciado manualmente. Ela atende cidades do sul de minas, provendo degustações junto a freelancers que contrata, tendo que realizar o gerenciamento tudo via WhatsApp. Cada fim de semana rodam cerca de 20 a 30 processos de degustação realizados por ela na região do sul de minas.

O Processo é simples. Geralmente ocorrem nos fins de semanas (sex, sab e domingo). Na sexta-feira um freelancer (contratada por ela) inicia o processo em um supermercado da região.

Ao iniciar o processo, o freelancer deve realizar uma série de checklists, até dar seu horário de saída, e assim vai até o ultimo dia (domingo). No primeiro e no ultimo dia possuem um checklist de entrada e saída diferentes, visto que no primeiro dia envolve a montagem da bancada (com materiais e produtos), assim como no ultimo dia envolve a desmontagem.

Para tudo deve haver um registro de evidencia fotográfica, contendo localização, data e hora. Esses dados são utilizados posteriormente para elaborar um relatório de fechamento que é enviado ao fornecedor.

## Objetivo do Cliente

Através desta implementação, a cliente pretende ter uma gestão de funcionários mais eficiente e centralizado, com geração de relatórios de forma automática e de forma que facilite também o processo para os funcionários.

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org) - Framework React para desenvolvimento web
- [TypeScript](https://www.typescriptlang.org/) - Linguagem de programação
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS para estilização
- [Firebase](https://firebase.google.com/) - Banco de dados e autenticação
- [Shadcn/ui](https://ui.shadcn.com/) - Biblioteca de componentes

#### Processo de Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configuração do Firebase (em breve):**
   - Crie um projeto no [Firebase](https://firebase.google.com/).
   - Adicione as credenciais do Firebase no arquivo `.env` conforme instruções do projeto.

4. **Inicie o projeto:**
   ```bash
   npm start
   ```

5. **Acesse no navegador:**
   - O projeto estará disponível em `http://localhost:3000`.


# Escala AMB CER IV

Este é um sistema web desenvolvido para auxiliar na geração automatizada de escalas semanais de atendimentos para equipes multidisciplinares, com base na Tabela AMB e modelos do CER IV. O sistema permite o cadastro e distribuição de profissionais, bem como a geração de relatórios em PDF.

## 🛠️ Tecnologias Utilizadas

- Python 3.9+
- Flask
- Pandas
- ReportLab (geração de PDF)
- Jinja2 (template rendering)
- HTML/CSS (Bootstrap ou personalizado)

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/lailtonjunior/escala_amb_cer4.git
cd escala_amb_cer4
2. Crie um ambiente virtual (recomendado)
bash
Copiar
Editar
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
3. Instale as dependências
Certifique-se de estar com o pip atualizado:

bash
Copiar
Editar
pip install --upgrade pip
Depois, instale os requisitos:

bash
Copiar
Editar
pip install -r requirements.txt
Se não houver um requirements.txt, instale manualmente:

bash
Copiar
Editar
pip install flask pandas reportlab
4. Execute a aplicação
bash
Copiar
Editar
python app.py
A aplicação estará disponível em:

cpp
Copiar
Editar
http://127.0.0.1:5000/
📁 Estrutura de Pastas (exemplo)
csharp
Copiar
Editar
escala_amb_cer4/
│
├── app.py                # Arquivo principal da aplicação Flask
├── templates/            # Templates HTML (Jinja2)
│   └── index.html        # Página inicial da aplicação
├── static/               # Arquivos estáticos (CSS, JS)
├── data/                 # (Opcional) Dados CSV ou tabelas AMB
├── output/               # Relatórios gerados em PDF
├── requirements.txt      # Lista de dependências
└── README.md             # Este arquivo
📑 Funcionalidades
Cadastro e edição de profissionais por especialidade

Distribuição automática da carga horária semanal

Geração de escala semanal

Exportação para PDF

Interface web intuitiva

📋 Requisitos do Sistema
Python 3.9 ou superior

Pip

Navegador moderno

✅ Sugestões Futuras
Autenticação de usuários

Banco de dados com Flask-SQLAlchemy

Geração de relatórios por profissional e por setor

Exportação para Excel

🤝 Contribuição
Pull requests são bem-vindos! Para mudanças significativas, abra uma issue antes para discutir o que você gostaria de modificar.

Desenvolvido por Lailton Junior

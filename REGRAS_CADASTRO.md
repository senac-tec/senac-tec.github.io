# Regras de Cadastro de Usuários

## 🔐 Regra Principal: UM USUÁRIO = UMA CONTA

### Política Implementada:

**Cada pessoa pode ter apenas UMA conta no sistema**, identificada por:
- ✅ E-mail único
- ✅ CPF único

### ❌ O que NÃO é permitido:

- Usar o mesmo e-mail para criar contas com cargos diferentes
- Usar o mesmo CPF para criar contas com cargos diferentes
- Ter múltiplas contas para a mesma pessoa

### ✅ O que É permitido:

- Uma pessoa com um e-mail e CPF únicos pode ter UMA conta
- O cargo pode ser alterado pelo administrador se necessário
- Cada pessoa física deve ter apenas um registro no sistema

## 📋 Exemplos:

### ❌ ERRADO:
```
Tentativa 1:
Email: joao@escola.com
CPF: 123.456.789-00
Cargo: Professor
Status: ✅ Criado

Tentativa 2:
Email: joao@escola.com  ← MESMO EMAIL
CPF: 123.456.789-00     ← MESMO CPF
Cargo: Coordenador
Status: ❌ BLOQUEADO - "E-mail já cadastrado como Professor"
```

### ✅ CORRETO:
```
Usuário 1:
Email: joao@escola.com
CPF: 123.456.789-00
Cargo: Professor
Status: ✅ Criado

Usuário 2:
Email: maria@escola.com  ← EMAIL DIFERENTE
CPF: 987.654.321-00      ← CPF DIFERENTE
Cargo: Coordenador
Status: ✅ Criado
```

## 🔄 Como Mudar o Cargo de um Usuário:

Se uma pessoa precisa mudar de cargo (ex: Professor vira Coordenador):

### Opção 1: Administrador altera o cargo
1. Admin acessa "Usuários"
2. Clica em "Editar" no usuário
3. Altera o campo "Cargo"
4. Salva

### Opção 2: Desativar e criar novo (NÃO RECOMENDADO)
1. Admin desativa a conta antiga
2. Cria nova conta com novo e-mail/CPF
3. ⚠️ Perde histórico de ações

**RECOMENDAÇÃO:** Sempre use a Opção 1 para manter o histórico.

## 🛡️ Validações Implementadas:

### No Backend (app.py):

#### 1. Ao Criar Usuário (Admin):
```python
# Verifica se email já existe
existing = cursor.execute('SELECT id, cargo FROM usuarios WHERE email = ?', (email,)).fetchone()
if existing:
    return error(f'E-mail já cadastrado para: {existing["cargo"]}')

# Verifica se CPF já existe
existing_cpf = cursor.execute('SELECT id, cargo FROM usuarios WHERE cpf = ?', (cpf,)).fetchone()
if existing_cpf:
    return error(f'CPF já cadastrado para: {existing_cpf["cargo"]}')
```

#### 2. Ao Cadastrar-se (Público):
```python
# Verifica se email já existe em qualquer cargo
existing = cursor.execute('SELECT cargo FROM usuarios WHERE email = ?', (email,)).fetchone()
if existing:
    return error(f'E-mail já cadastrado como {existing["cargo"]}. Cada pessoa pode ter apenas uma conta.')
```

### No Frontend (cadastro.js):

```javascript
// Mensagens amigáveis
if (errorMsg.includes('já está cadastrado')) {
    showAlert('⚠️ ' + errorMsg, 'error');
}
```

## 📊 Benefícios desta Regra:

1. **Segurança**: Evita duplicação de identidades
2. **Integridade**: Mantém dados consistentes
3. **Auditoria**: Facilita rastreamento de ações
4. **Simplicidade**: Uma pessoa = uma conta = um cargo
5. **Controle**: Administrador tem controle total sobre cargos

## 🔍 Como Verificar Duplicatas:

### SQL para encontrar emails duplicados:
```sql
SELECT email, COUNT(*) as total 
FROM usuarios 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### SQL para encontrar CPFs duplicados:
```sql
SELECT cpf, COUNT(*) as total 
FROM usuarios 
GROUP BY cpf 
HAVING COUNT(*) > 1;
```

## ⚠️ Casos Especiais:

### E se alguém já tiver conta duplicada?

1. **Identificar**: Usar SQL acima
2. **Decidir**: Qual conta manter (mais recente? mais ativa?)
3. **Migrar dados**: Se necessário, migrar dados importantes
4. **Desativar**: Desativar conta duplicada
5. **Excluir**: Opcionalmente excluir após backup

### E se alguém esquecer que já tem conta?

1. Tentar fazer login
2. Se não lembrar senha: "Esqueci minha senha"
3. Contatar administrador
4. Admin pode resetar senha ou informar o cargo existente

## 📞 Mensagens de Erro:

### Para Usuário:
```
"Este e-mail já está cadastrado no sistema como Professor. 
Cada pessoa pode ter apenas uma conta."
```

### Para Admin:
```
"E-mail já cadastrado para um usuário com cargo: Coordenador"
```

## ✅ Status da Implementação:

- ✅ Validação no backend (criar usuário)
- ✅ Validação no backend (cadastro público)
- ✅ Mensagens de erro amigáveis
- ✅ Documentação criada
- ⏳ Limpeza de duplicatas existentes (se houver)

## 🚀 Próximos Passos:

1. Verificar se há duplicatas no banco atual
2. Limpar duplicatas se existirem
3. Testar criação de usuários
4. Testar cadastro público
5. Documentar para usuários finais

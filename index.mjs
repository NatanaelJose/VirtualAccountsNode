import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";

operation();
function operation(){
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Transferir Saldo',
            'Apagar Conta',
            'Sair'
        ],
    }]).then((ans)=>{
        const act = ans['action'];
        
        switch (act) {
            case "Criar Conta":
                creatAccount()
                break;
            case "Consultar Saldo":
                getAccountBalance();
                break;
            case "Depositar":
                deposit();
                break;
            case "Sacar":
                withdraw();
                break;
            case "Transferir Saldo":
                transfer();
                break;
            case "Apagar Conta":
                deleteAccount();
                break;
            default:
                console.log(chalk.bgBlueBright.black("Obrigado por usar o ContasVirtuais"))
                process.exit()
        }
    }).catch((err)=>console.log(err))
}

function creatAccount() {
    console.log(chalk.bgGreen.black("Obrigado por escolher nosso banco!"));
    console.log(chalk.green("defina as opções da sua conta:"));
    createAccount();
}

function createAccount() {
    inquirer.prompt([{
        name:"AccountName",
        message: "Digite o nome da sua conta:"
    }]).then((ans)=>{
        const accountName = ans["AccountName"];

        console.info(accountName);

        if(!fs.existsSync("accounts")){
            fs.mkdirSync("accounts");
        }
        if(fs.existsSync(`./accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black("Essa conta já existe!"));
            createAccount();
            return;
        }
        fs.writeFileSync(`./accounts/${accountName}.json`, '{"balance": "0"}', function(err){console.log(err)});
        console.log(chalk.bgGreen.black("Sua conta foi criada!"));
        operation();
    }).catch((err)=>console.log(err));
}

function deposit(){
    inquirer.prompt([{
        name: "accountName",
        message: "qual o nome da sua conta?"
    }]).then((ans)=>{
        const accountName = ans["accountName"];

        if(!checkAcount(accountName)){
            return deposit();
        }

        inquirer.prompt([{
            name: "amount",
            message: "quanto você deseja depositar?"
        }]).then((ans)=>{
            const amount = ans["amount"];
            addAmount(accountName, amount);
            operation();
        }).catch((err)=>console.log(err));
    }).catch((err)=>console.log(err));
}

function checkAcount(accountName){
    if(!fs.existsSync(`./accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black("Essa conta não existe!"));
        return false;
    };
    return true;
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName);

    if(!amount) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"))
        return deposit();
    }

    accountData.balance = parseFloat(amount)+parseFloat(accountData.balance);
    
    fs.writeFileSync(`./accounts/${accountName}.json`, JSON.stringify(accountData), function(err){console.log(err)});
    console.log(chalk.bgGreen.black(`Foi depositado R$${amount} na sua conta!`))
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`./accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(accountJSON);
}

function getAccountBalance(){
    inquirer.prompt([{
        name: "accountName",
        message: "qual o nome da sua conta?"
    }]).then((ans)=>{
        const accountName = ans["accountName"];
        if(!checkAcount(accountName)){
            console.log(chalk.bgRed.black("Essa conta não existe, tente de novo!"));
            return getAccountBalance();
        }
        const accountData = getAccount(accountName);

        console.log(chalk.bgBlue.black(`Olá! Seu saldo bancário é de R$${accountData.balance}`));
        operation();
    }).catch((err)=>{console.log(err)});
}

function withdraw(){
    inquirer.prompt([{
        name: "accountName",
        message: "qual o nome da sua conta?"
    }]).then((ans)=>{
        const accountName = ans["accountName"];
        if(!checkAcount(accountName)){
            console.log(chalk.bgRed.black("Essa conta não existe, tente de novo!"));
            return withdraw();
        }
        inquirer.prompt([{
            name: "amount",
            message: "quanto você deseja sacar?"
        }]).then((ans)=>{
            const amount = ans["amount"];
            withdrawAmount(accountName, amount);
        }).catch((err)=>console.log(err));
    }).catch((err)=>{console.log(err)});
}

function withdrawAmount(accountName, amount){
    const accountData = getAccount(accountName);
    const accountBalance = parseFloat(accountData.balance);
    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"));
        return withdraw();
    }
    if(accountBalance<amount) {
        console.log(chalk.bgRed.black("Valor indisponível"));
        return withdraw();
    }
    accountData.balance = accountBalance - parseFloat(amount);

    fs.writeFileSync(`./accounts/${accountName}.json`, JSON.stringify(accountData), function(err){console.log(err)});
    console.log(chalk.bgGreen.black(`Você sacou R$${amount} da sua conta!`))
    operation();
}

function deleteAccount(){
    inquirer.prompt([{
        name: "accountName",
        message: "qual o nome da sua conta?"
    }]).then((ans)=>{
        const accountName = ans["accountName"];

        if(!checkAcount(accountName)){
            return deleteAccount();
        }
        fs.unlinkSync(`./accounts/${accountName}.json`, (err)=>{
            console.log(err);
        })
        console.log(chalk.bgRed.black(`Você deletou a conta: ${accountName}`));
        operation();
    }).catch((err)=>console.log(err));
}

function transfer(){
    inquirer.prompt([{
        name: "accountName",
        message: "qual o nome da conta que irá transferir?"
    }]).then((ans)=>{
        const accountSender = ans['accountName'];
        if(!checkAcount(accountSender)){
            return transfer();
        }
        inquirer.prompt([{
            name: "accountName",
            message: "qual o nome da conta que irá receber?"
        }]).then((ans)=>{
            const recieveraccount = ans['accountName'];
            if(!checkAcount(recieveraccount)){
                return transfer();
            }
            inquirer.prompt([{
                name: "amount",
                message: "quanto você deseja sacar?"
            }]).then((ans)=>{
                const amount = ans["amount"];
                if(!amount){
                    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"));
                    return transfer();
                }
                transferBetween(accountSender, recieveraccount, amount);
            }).catch((err)=>console.log(err));
        }).catch((err)=>console.log(err));
    }).catch((err)=>console.log(err));
}

function transferBetween(accountSender, recieveraccount, amount) {
    const SenderData = getAccount(accountSender)
    const recieverData = getAccount(recieveraccount);
    const amounted = parseFloat(amount);
    if(parseFloat(getAccount(accountSender).balance)<amount) {
        console.log(chalk.bgRed.black("Valor indisponível"));
        return transfer();
    }
    SenderData.balance = parseFloat(getAccount(accountSender).balance) - amounted;
    recieverData.balance = parseFloat(getAccount(recieveraccount).balance) + amounted;

    fs.writeFileSync(`./accounts/${accountSender}.json`, JSON.stringify(SenderData), function(err){console.log(err)});
    fs.writeFileSync(`./accounts/${recieveraccount}.json`, JSON.stringify(recieverData), function(err){console.log(err)});
    console.log(chalk.bgGreen.black(`${accountSender} transferiu R$${amount} para ${recieveraccount}!`));
    operation();
}
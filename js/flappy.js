// cria todo o cenário de barras
function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    // console.log(elemento)
    return elemento
}

// cria todo o cenário de barras
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// sorteia a posição das barras
function ParDeBarreiras(altura, abertura, popsicaoNaTela) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)


    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX =  popsicaoNaTela => this.elemento.style.left = `${popsicaoNaTela}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(popsicaoNaTela)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouMeio) {
                notificarPonto()
            }
        })
    }
}

// cria a posição do pássaro
function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'img/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientWidth

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}

function Progresso() {

    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird(
                nome, 
                cenario, 
                intervaloCanos, 
                distanciaCanos, 
                velocidadeCanos, 
                personagem, 
                tipoJogo, 
                velocidadePersonagem, 
                pontuacao){

    let pontos = 0
    // modificando cenário do jogo
    const areaDoJogo = document.querySelector('[wm-flappy]')
    if(cenario === 'diurno'){
        areaDoJogo.style.backgroundColor = 'dodgerblue';
    }else{
        areaDoJogo.style.backgroundColor = 'gray';
    }

    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()

    // definindo intervalo e distância de acordo com info do forms
    const barreiras = new Barreiras(altura, largura, parseInt(intervaloCanos), parseInt(distanciaCanos),
        () => progresso.atualizarPontos(pontos += parseInt(pontuacao))) // ajusta o valor da pontuação no decorrer do jogo

    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

              if(colidiu(passaro,barreiras)){
                 clearInterval(temporizador) 
             }

        // definindo veloc de acordo com o forms
        }, velocidadeCanos)
    }
}

// iniciava o jogo
new FlappyBird().start();

const forms = document.querySelectorAll('#formulario');

// pqgo os novos valores para aplicar no jogo
forms.addEventListener("click", function(e){
    e.preventDefault();

    const nome = querySelectorAll('#nomeJog');
    const cenario = querySelectorAll('opcao-cena');
    const intervaloCanos = querySelectorAll('opcao-nivel');
    const distanciaCanos = querySelectorAll('opcao-distancia');
    const velocidadeCanos = querySelectorAll('rangenumber');
    const personagem = querySelectorAll('.opPerson');
    const tipoJogo = querySelectorAll('opcao-tipo');
    const velocidadePersonagem = querySelectorAll('opcao-veloPersonagem');
    const pontuacao = querySelectorAll('opcao-pontuacao');

    // verifico se os valores estão chegando corretamente pelo console
    console.table(
        "nome", nome, 
        "cenario", cenario, 
        "intervalo Canos", intervaloCanos, 
        "dist canos", distanciaCanos, 
        "valo canos", velocidadeCanos, 
        "personagem", personagem, 
        "tipo de jogo", tipoJogo, 
        "veloc personagem", velocidadePersonagem, 
        "pontuação", pontuacao
    );

    //repasso as novas configurações para o jogo
    new FlappyBird(
        nome, 
        cenario, 
        intervaloCanos, 
        distanciaCanos, 
        velocidadeCanos, 
        personagem, 
        tipoJogo, 
        velocidadePersonagem, 
        pontuacao
    ).start();
})
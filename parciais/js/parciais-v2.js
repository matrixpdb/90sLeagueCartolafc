$(document).ready(function() {
	buscarTimes();
});

function moverProgressBar() {
	var elem = document.getElementById("myBar"),
		qtdReqTotal = 34; // 30 times + 4 requisicoes do $.when

	if(qtdReqTotal > 0 && (qtdReqExecutas <= qtdReqTotal)) {
		var tam = (qtdReqExecutas*100)/qtdReqTotal + '%';
		elem.style.width = tam;
	}
}

function buscarTimes() {
	$.when(
		$.ajax(dadosMercadoRodada()),
		$.ajax(dadosRequisicaoParciais()),
		$.ajax(dadosRequisicaoLiga(1)),
		$.ajax(dadosRequisicaoLiga(2))
	).then(function(mercado_rodada, parciais, ligaPagina1, ligaPagina2) {
		usufruirDadosColetados(mercado_rodada, parciais, ligaPagina1, ligaPagina2);
	});
}

function usufruirDadosColetados(mercado_rodada, parciais, ligaPagina1, ligaPagina2) {
	obterInformacoesRodadaMercado(mercado_rodada);
	exibirInformacoesRodadaMercado();
	obterTimesNaLiga(ligaPagina1, ligaPagina2);
	
	if(statusAtualMercado == 2) {
		obterPartidasRodada();
		obterParciaisJogadores(parciais);
	}

	coletarTimesDoSite();

	var intervalo = setInterval(function() {
		if(timesColetadosSite.length == timesLiga.length) {
			obterInformacoesDosTimes();
			ordenarPorPontuacaoGeral();
			exibirInformacoesDosTimes();
			clearInterval(intervalo);
		}
	}, 100);
}

function obterInformacoesRodadaMercado(mercado_rodada) {
	statusAtualMercado = mercado_rodada[0].status_mercado;
	rodadaAtual = mercado_rodada[0].rodada_atual;
}

function obterParciaisJogadores(parciais) {
	jogadoresPontuadosSite = parciais[0].atletas;
}

function obterTimesNaLiga(pagina1, pagina2) {
	timesLiga = pagina1[0].times;
	
	for(var x in pagina2[0].times) {
		timesLiga.push(pagina2[0].times[x]);
	}
}

function coletarTimesDoSite() {
	for(var time in timesLiga) {
		dadosRequisicaoTime(timesLiga[time].slug);
    }
}

function obterInformacoesDosTimes() {
	var timeSite = null;
	
	for(var x in timesColetadosSite) {
		var timeMontado = null,
			pontuacaoTime = 0;
		
		timeSite = timesColetadosSite[x];
		pontuacaoTime = obterPontuacaoTime(timeSite);
		timeMontado = obterTimeMontado(timeSite, pontuacaoTime);
		timesTabela.push(timeMontado);
	}
}

function obterPontuacaoTime(time) {
	var pontuacaoTime = 0,
		qtdJogadoresPontuados = 0,
		pontuacaoJogador = 0,
		jogadores = time.atletas,
		retorno = {pontuacao: 0, quantidade: 0};

	for(var y in jogadores) {
		pontuacaoJogador = obterPontuacaoJogador(jogadores[y]);
		
		if(pontuacaoJogador != null && pontuacaoJogador != 0) {
			pontuacaoTime += pontuacaoJogador;
			qtdJogadoresPontuados += 1;
		} else if(statusAtualMercado != 1 && partidaIniciada(jogadores[y])) {
			pontuacaoTime += 0.00;
			qtdJogadoresPontuados += 1;
		}
	}
	
	retorno.pontuacao = pontuacaoTime;
	retorno.quantidade = qtdJogadoresPontuados;
	
	return retorno;
}

function obterPontuacaoJogador(jogador) {
	var pontuacao = null,
		jogadorPossuiPontuacao = jogadoresPontuadosSite[jogador.atleta_id] != null;
	
	if(jogadorPossuiPontuacao) {
		pontuacao = jogadoresPontuadosSite[jogador.atleta_id].pontuacao;
	}
	
	return pontuacao;
}

function partidaIniciada(jogador) {
	var iniciou = false,
		clube = jogador.clube_id,
		dataBruta = obterDataBruta(jogador),
		dataPartida = "",
		dataAgora = new Date();
	
	if(dataBruta != null && dataBruta.trim() != "") {
		dataPartida = new Date(dataBruta);
	
		if(dataPartida <= dataAgora) {
			iniciou = true;
		}
	}

	return iniciou;
}

function obterDataBruta(jogador) {
	var partidas = partidasCampeonato.partidas;
    var clube = jogador.clube_id;
    var dataBruta = null;
       
    for(var i = 0; i < partidas.length; i++) {
      var partida = partidas[i];
      
      if (clube == partida.clube_casa_id || clube == partida.clube_visitante_id) {	       
        dataBruta = partida.partida_data;
        break;
      }
    }  

    return dataBruta;   
}

function obterTimeMontado(time, pontuacao) {
	var timeMontado = {};
	
	timeMontado.id = time.time.slug;
	timeMontado.nome = time.time.nome;
	timeMontado.qtdPontuados = pontuacao.quantidade;
	timeMontado.pontuacaoParcial = pontuacao.pontuacao;
	timeMontado.pontuacaoAnterior = obterPontuacaoNoTurno(time);
	timeMontado.pontuacaoGeral = timeMontado.pontuacaoParcial + timeMontado.pontuacaoAnterior;
	
	return timeMontado;
}

function obterPontuacaoNoTurno(time) {
	var id = time.time.slug,
		pontos = 0;
	
	// Inicio de segundo turno
	if(rodadaAtual == 20) {
		pontos = 0;
	} else {
		for(var x in timesColetadosSite) {
			if(timesLiga[x].slug == id) {
				pontos = timesLiga[x].pontos.turno;
				pontos = parseFloat(pontos);
				break;
			}
		}
	}
	
	return pontos;
}

function acionarBotoesOrdenacao() {
	$("#ordenacaoParcial").click(function() {
		ordenarPorParciais();
		exibirInformacoesDosTimes();
	});
	
	$("#ordenacaoPontuacaoGeral").click(function() {
		ordenarPorPontuacaoGeral();
		exibirInformacoesDosTimes();
	});
}

function ordenarPorParciais() {
	timesTabela.sort(function(a, b) {
	    return b.pontuacaoParcial - a.pontuacaoParcial;
	});
}

function ordenarPorPontuacaoGeral() {
	timesTabela.sort(function(a, b) {
		return b.pontuacaoGeral - a.pontuacaoGeral;
	});
}

function exibirInformacoesRodadaMercado() {
	$(".team_rodada").html("(" + rodadaAtual + "a Rodada)");
	$("#mercado_status").html(statusMercado[statusAtualMercado]);
}

function exibirInformacoesDosTimes() {
	var index = 1;
	
	$("#tabela-pontos tbody").empty();
	
	for(var x in timesTabela) {
		var id_nome = timesTabela[x].id + "_nome",
			id_pontuacao_parcial = timesTabela[x].id + "_pontuacao_parcial",
			id_qtd_pontuados = timesTabela[x].id + "_pontuados",
			id_pontuacao_geral = timesTabela[x].id + "_pontuacao_geral",
			id_pontuacao_soma = timesTabela[x].id + "_pontuacao_soma",
			linha = (index % 2 != 0) ? "<tr>" : "<tr class='pure-table-odd'>";
		
		linha += "<td>" + index + "</td><td id=" + id_nome + "></td><td id=" + id_qtd_pontuados + "></td><td id=" + id_pontuacao_parcial + "></td><td id=" + id_pontuacao_geral + "></td><td id=" + id_pontuacao_soma + "></td></tr>";
		$("#tabela-pontos tbody").append(linha);
		
		var _team_nome = $("#"+id_nome),
			_team_pontuacao_parcial = $("#"+id_pontuacao_parcial),
			_team_qtd_pontuados = $("#"+id_qtd_pontuados),
		    _team_pontuacao_geral = $("#"+id_pontuacao_geral),
			_team_pontuacao_soma = $("#"+id_pontuacao_soma);
		
		_team_nome.html(timesTabela[x].nome);
	    _team_pontuacao_parcial.html(timesTabela[x].pontuacaoParcial.toFixed(2));
	    _team_qtd_pontuados.html(timesTabela[x].qtdPontuados);
	    _team_pontuacao_geral.html(timesTabela[x].pontuacaoAnterior.toFixed(2));
	    _team_pontuacao_soma.html(timesTabela[x].pontuacaoGeral.toFixed(2));
	    
	    index += 1;
	}

	$("div.progress").width(1 + $("#tabela-pontos tbody").width());
	
	acionarBotoesOrdenacao();
}

function obterPartidasRodada() {
	$.ajax({
		type: "GET",
		contentType: "application/json",
		cache: false,
		url: "load-api-v2.php",
		timeout: 20000,
		data: {
    		api: "partidas",
    		rodada: rodadaAtual
    	},
    	success: function(partidas) {    		
    		partidasCampeonato = {};
    		partidasCampeonato = partidas;	
    		tentativasM1 = 1;
			//qtdReqExecutas++;
    		//moverProgressBar(); 
	    },
    	error: function(jqXHR, textStatus, errorThrown) {
    		if(tentativasM1 < 10) {
    			tentativasM1 = tentativasM1 + 1;
    			obterPartidasRodada();
    		} else {
	    		exibirMensagemErro("M1");
	    		return false;
	    	}
    	}
	});
}

function dadosRequisicaoTime(slug) {
	$.ajax({
		type: "GET",
		contentType: "application/json",
		cache: false,
		url: "load-api-v2.php",
		timeout: 20000,
		data: {
    		api: "busca-atletas",
    		team_slug: slug
    	},
    	async: false,
    	success: function(timeSite) {    		
    		timesColetadosSite.push(timeSite);  
    		tentativasM2 = 1;
			qtdReqExecutas++;
    		moverProgressBar();
	    },
    	error: function(jqXHR, textStatus, errorThrown) {
    		if(tentativasM2 < 10) {
    			tentativasM2 = tentativasM2 + 1;
    			dadosRequisicaoTime(slug);
    		} else {
    			exibirMensagemErro("M2");
    			return false;
    		}
    	}
	});
}

function dadosRequisicaoParciais() {
	return {
	    type: "GET",
	    contentType: "application/json",
	    dataType: "json",
	    cache: false,
	    url: "load-api-v2.php?api=parciais-atletas",
		timeout: 20000,
		success: function() {
			qtdReqExecutas++;
			moverProgressBar();
		},
    	error: function(jqXHR, textStatus, errorThrown) {
    		if(tentativasM3 < 10) {
    			tentativasM3 = tentativasM3 + 1;
    			dadosRequisicaoParciais();
    		} else {
	    		exibirMensagemErro("M3");
	    		return false;
	    	}
    	}
	}
}

function dadosRequisicaoLiga(pagina) { 
	return {
    	type: "GET",
	    contentType: "application/json",
	    cache: false,
	    url: "load-api-auth-v2.php",
	    data: {
			api: "liga",
			page: pagina,
			liga_slug: "90s-league"
	    },
	    timeout: 20000,
		success: function(timesLiga) {	
			//for(var x in timesLiga.times) {
			//	qtdReqTotal++;
			//}
			qtdReqExecutas++;
			moverProgressBar();
		},
	    error: function (jqXHR, textStatus, errorThrown) {
	    	if(tentativasM4 < 10) {
    			tentativasM4 = tentativasM4 + 1;
    			dadosRequisicaoLiga(pagina);
    		} else {
	    		exibirMensagemErro("M4");
	    		return false;
	    	}
	    }
    }
}

function dadosMercadoRodada() {
	return {
	    type: "GET",
	    contentType: "application/json",
	    dataType: "json",
	    cache: false,
	    url: "load-api-v2.php?api=mercado-status",
	    timeout: 20000,
		success: function() {
			qtdReqExecutas++;
			moverProgressBar();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if(tentativasM5 < 10) {
    			tentativasM5 = tentativasM5 + 1;
    			dadosMercadoRodada();
    		} else {
	    		exibirMensagemErro("M5");
	    		return false;
	    	}
		}
	};
}

function exibirMensagemErro(origem) {
	if(!existeFalha) {
		existeFalha = true;
		alert("Globo.com - Desculpe-nos, nossos servidores est\xE3o sobrecarregados. Cod: " + origem);
	}
}

var rodadaAtual = 0,
	tentativasM1 = 1,
	tentativasM2 = 1,
	tentativasM3 = 1,
	tentativasM4 = 1,
	tentativasM5 = 1,
	statusAtualMercado = 0,
	partidasCampeonato = {},
	jogadoresPontuadosSite = {},
	timesColetadosSite = [],
	timesLiga = [],
	timesTabela = [],
	existeFalha = false,
	//qtdReqTotal = 0,
	qtdReqExecutas = 0,
	statusMercado = {
		1:'Mercado aberto!',
	  	2:'Mercado fechado!',
	  	3:'Mercado em atualiza��o!',
	  	4:'Mercado em manuten��o!'
	};
	
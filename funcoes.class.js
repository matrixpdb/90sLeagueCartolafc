// Classe para chamar o Json.
function json(){
    var qtd;
    var retorno;

    // Resgatar valores.
    json.prototype.resgatarValores = function(){
        $('#resultado').html('Carregando dados...');

        // Estrutura de resultado.
        $.getJSON('mercado.json', function(data){
            this.qtd = data.atletas.length;
            this.retorno = '';

            for (i = 0; i < this.qtd; i++){
                var foto = (""+(data.atletas[i].foto)).replace(/FORMATO/, '140x140');

                //this.retorno += 'ID: ' + data.atletas[i].nome+ '<br />';
                //this.retorno += ' Apelido: ' + data.atletas[i].apelido + ' - ' + '<br />';
                //this.retorno += ' Media: ' + data.atletas[i].media_num + '<br /><br />';
                //recupera as imagens no servidor do cartola
                this.retorno += '<img src=" '+ foto +'">';
                 var imagem = '<img src=" '+ foto +'">';
                // prototipo
                var linha = $('<tr><th>Nome</th><td><th>Apelido</th></td><td><th>Media</th></td><td><th>Foto</th></td><td></td></tr>');


                // alteracoes
                var nova_linha = linha.clone();
                $('td:eq(0)', nova_linha).text(data.atletas[i].nome);
                $('td:eq(1)', nova_linha).text(data.atletas[i].apelido);
                $('td:eq(2)', nova_linha).text(data.atletas[i].media_num);
                $('td:eq(3)', nova_linha).html(imagem);

                $('#resultado table').append(nova_linha);

            }


            //$('#resultado').html(this.retorno);




        });

    }

}

// Objeto.
var obj = new json();
obj.resgatarValores();
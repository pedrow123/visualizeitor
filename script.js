// script.js
$(document).ready(function() {
    $('#buscar').on('click', function() {
        var ra = $('#ra').val();
        console.log(ra)
        if (ra) {
            carregarDadosAluno(ra);
        }
    });

    function loadData(callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                callback(this.responseXML);
            }
        };
        xmlhttp.open("GET", "alunos.xml", true);
        xmlhttp.send();
    }

    function carregarDadosAluno(ra) {
        loadData(function(xmlDoc) {
            var alunos = xmlDoc.getElementsByTagName("ALUNO");
            var alunoData = [];

            for (var i = 0; i < alunos.length; i++) {
                var aluno = alunos[i];
                var matricula = aluno.getElementsByTagName("MATR_ALUNO")[0].childNodes[0].nodeValue;

                if (matricula === ra) {
                    var alunoInfo = {
                        COD_ATIV_CURRIC: aluno.getElementsByTagName("COD_ATIV_CURRIC")[0].childNodes[0].nodeValue,
                        NOME_ATIV_CURRIC: aluno.getElementsByTagName("NOME_ATIV_CURRIC")[0].childNodes[0].nodeValue,
                        SITUACAO: aluno.getElementsByTagName("SITUACAO")[0].childNodes[0].nodeValue,
                        MEDIA_FINAL: aluno.getElementsByTagName("MEDIA_FINAL")[0].childNodes[0].nodeValue,
                        FREQUENCIA: aluno.getElementsByTagName("FREQUENCIA")[0].childNodes[0].nodeValue,
                        ANO: aluno.getElementsByTagName("ANO")[0].childNodes[0].nodeValue,
                        PERIODO: aluno.getElementsByTagName("PERIODO")[0].childNodes[0].nodeValue
                    };
                    alunoData.push(alunoInfo);
                }
            }

            if (alunoData.length > 0) {
                var grade = gerarGrade(alunoData);
                $('#grade-curricular').html(grade);
            } else {
                alert("Aluno não encontrado");
            }
        });
    }

    function gerarGrade(alunoData) {
        var grade = '';
        alunoData.forEach(function(disciplina) {
            var codigo = disciplina.COD_ATIV_CURRIC;
            var nome = disciplina.NOME_ATIV_CURRIC;
            var situacao = disciplina.SITUACAO.toLowerCase();
            var ultimaNota = disciplina.MEDIA_FINAL;
            var ultimaFrequencia = disciplina.FREQUENCIA;
            var ultimoAnoSemestre = disciplina.ANO + ' ' + disciplina.PERIODO;

            var cor = '';
            switch (situacao) {
                case 'aprovado':
                    cor = 'green';
                    break;
                case 'reprovado':
                    cor = 'red';
                    break;
                case 'matriculado':
                    cor = 'blue';
                    break;
                case 'equivalencia':
                    cor = 'yellow';
                    break;
                default:
                    cor = 'white';
            }

            grade += '<div class="disciplina" style="background-color:' + cor + '" ' +
                'data-codigo="' + codigo + '" ' +
                'data-nome="' + nome + '" ' +
                'data-ultimaNota="' + ultimaNota + '" ' +
                'data-ultimaFrequencia="' + ultimaFrequencia + '" ' +
                'data-ultimoAnoSemestre="' + ultimoAnoSemestre + '">' + 
                nome + '</div>';
        });

        return grade;
    }

    $(document).on('click', '.disciplina', function(event) {
        if (event.which === 1) {
            // Botão esquerdo
            var info = 'Código: ' + $(this).data('codigo') + '<br>' +
                'Nome: ' + $(this).data('nome') + '<br>' +
                'Última vez cursada: ' + $(this).data('ultimoAnoSemestre') + '<br>' +
                'Nota: ' + $(this).data('ultimaNota') + '<br>' +
                'Frequência: ' + $(this).data('ultimaFrequencia');

            $('#popup-info').html(info);
            $('#popup').show();
        } else if (event.which === 3) {
            // Botão direito
            var codigo = $(this).data('codigo');
            var historico = alunoData.filter(function(disciplina) {
                return disciplina.COD_ATIV_CURRIC === codigo;
            }).map(function(disciplina) {
                return 'Ano/Semestre: ' + disciplina.ANO + ' ' + disciplina.PERIODO + '<br>' +
                    'Nota: ' + disciplina.MEDIA_FINAL + '<br>' +
                    'Frequência: ' + disciplina.FREQUENCIA;
            }).join('<br><br>');

            $('#popup-info').html(historico);
            $('#popup').show();
        }
    });

    $('.close').on('click', function() {
        $('#popup').hide();
    });
});

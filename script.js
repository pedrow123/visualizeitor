$(document).ready(function() {
    let alunoData = [];
    const gradeCurricular = [
        ['CI068', 'CI210', 'CI212', 'CI215', 'CI162', 'CI163', 'CI221', 'OPT'],
        ['CI055', 'CI056', 'CI057', 'CI062', 'CI065', 'CI165', 'CI211', 'OPT'],
        ['CM046', 'CI067', 'CI064', 'CE003', 'CI059', 'CI209', 'OPT', 'OPT'],
        ['CM045', 'CM005', 'CI237', 'CI058', 'CI061', 'CI218', 'OPT', 'OPT'],
        ['CM201', 'CM202', 'CI166', 'CI164', 'SA214', 'CI220', 'TG I', 'TG II'],
    ];

    $('#buscar').on('click', function() {
        var ra = $('#ra').val();
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
        xmlhttp.open("GET", "/pwa21/visualizeitor/alunos.xml", true);
        xmlhttp.send();
    }

    function carregarDadosAluno(ra) {
        loadData(function(xmlDoc) {
            var alunos = xmlDoc.getElementsByTagName("ALUNO");
            alunoData = [];

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
                        PERIODO: aluno.getElementsByTagName("PERIODO")[0].childNodes[0].nodeValue,
                        SIGLA: aluno.getElementsByTagName("SIGLA")[0].childNodes[0].nodeValue
                    };


                    
                    // alunoData.push(alunoInfo);
                    var index = alunoData.findIndex(item => item.COD_ATIV_CURRIC === alunoInfo.COD_ATIV_CURRIC);
                    if(alunoInfo.COD_ATIV_CURRIC === "CM005")
                        console.log(alunoInfo, alunoInfo.ANO)

                    if (index !== -1) {
                        // Se o ano do novo item for maior, substitui o existente
                        if (parseInt(alunoInfo.ANO) > parseInt(alunoData[index].ANO)) {
                            alunoData[index] = alunoInfo;
                        } else if (parseInt(alunoInfo.ANO) === parseInt(alunoData[index].ANO)){
                            if(alunoInfo.PERIODO === "2o. Semestre"){
                                alunoData[index] = alunoInfo;
                            }
                        }
                    } else {
                        // Adicionar se não encontrado
                        alunoData.push(alunoInfo);
                    }
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
        gradeCurricular.forEach(function(semestre, index) {
            grade += '<div class="semestre">';
            semestre.forEach(function(disciplina) {
                var situacao = alunoData.find(d => d.COD_ATIV_CURRIC === disciplina)?.SITUACAO.toLowerCase() || 'não cursado';
                var cor = '';
                switch (situacao) {
                    case 'aprovado':
                        cor = 'green';
                        break;
                    case 'reprovado por nota':
                    case 'reprovado por frequência':
                        cor = 'red';
                        break;
                    case 'matrícula':
                        cor = 'blue';
                        break;
                    case 'equivalência de disciplina':
                        cor = 'yellow';
                        break;
                    default:
                        cor = 'white';
                        break;
                }

                grade += '<div class="disciplina" style="background-color:' + cor + '" ' +
                    'data-codigo="' + disciplina + '">' + 
                    disciplina + '</div>';
            });
            grade += '</div>';
        });

        return grade;
    }

    $(document).on('click', '.disciplina', function(event) {
        if (event.which === 1) {
            // Botão esquerdo
            var codigo = $(this).data('codigo');
            var disciplina = alunoData.find(d => d.COD_ATIV_CURRIC === codigo);
            if (disciplina) {
                var info = 'Código: ' + disciplina.COD_ATIV_CURRIC + '<br>' +
                    'Nome: ' + disciplina.NOME_ATIV_CURRIC + '<br>' +
                    'Última vez cursada: ' + disciplina.ANO + ' ' + disciplina.PERIODO + '<br>' +
                    'Nota: ' + disciplina.MEDIA_FINAL + '<br>' +
                    'Frequência: ' + disciplina.FREQUENCIA;

                $('#popup-info').html(info);
                $('#popup').show();
            }
        } else if (event.which === 3) {
            // Botão direito
            var codigo = $(this).data('codigo');
            var historico = alunoData.filter(d => d.COD_ATIV_CURRIC === codigo)
                .map(d => 'Ano/Semestre: ' + d.ANO + ' ' + d.PERIODO + '<br>' +
                    'Nota: ' + d.MEDIA_FINAL + '<br>' +
                    'Frequência: ' + d.FREQUENCIA)
                .join('<br><br>');

            $('#popup-info').html(historico);
            $('#popup').show();
        }
    });

    $('.close').on('click', function() {
        $('#popup').hide();
    });
});
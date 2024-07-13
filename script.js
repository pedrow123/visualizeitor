$(document).ready(function() {
    let alunoData = [];
    let alunoHistorico = {};
    const gradeCurricular = [
        ['CI068', 'CI210', 'CI212', 'CI215', 'CI162', 'CI163', 'CI221', 'OPT'],
        ['CI055', 'CI056', 'CI057', 'CI062', 'CI065', 'CI165', 'CI211', 'OPT'],
        ['CM046', 'CI067', 'CI064', 'CE003', 'CI059', 'CI209', 'OPT', 'OPT'],
        ['CM045', 'CM005', 'CI237', 'CI058', 'CI061', 'CI218', 'OPT', 'OPT'],
        ['CM201', 'CM202', 'CI166', 'CI164', 'SA214', 'CI220', 'TG I', 'TG II'],
    ];

    const disciplinasOptativas = [
        'CI069', 'CI084', 'CI085', 'CI086', 'CI087', 'CI088', 'CI089', 'CI090', 'CI091', 'CI092',
        'CI093', 'CI094', 'CI095', 'CI097', 'CI167', 'CI168', 'CI169', 'CI170', 'CI171', 'CI172',
        'CI173', 'CI174', 'CI204', 'CI205', 'CI214', 'CI301', 'CI302', 'CI303', 'CI304', 'CI305',
        'CI306', 'CI309', 'CI310', 'CI311', 'CI312', 'CI313', 'CI314', 'CI315', 'CI316', 'CI317',
        'CI318', 'CI320', 'CI321', 'CI337', 'CI338', 'CI339', 'CI340', 'CI350', 'CI351', 'CI355',
        'CI358', 'CI359', 'CI360', 'CI361', 'CI362', 'CI363', 'CI364', 'CI365', 'CI366', 'CI367',
        'CI394', 'CI395', 'CI396', 'ET082', 'CE211', 'CM043', 'HL077', 'SA017', 'SC003', 'SC202',
        'SC203'
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
        xmlhttp.open("GET", "alunos.xml", true);
        xmlhttp.send();
    }

    function carregarDadosAluno(ra) {
        loadData(function(xmlDoc) {
            var alunos = xmlDoc.getElementsByTagName("ALUNO");
            alunoData = [];
            alunoHistorico = {};
    
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
    
                    var index = alunoData.findIndex(item => item.COD_ATIV_CURRIC === alunoInfo.COD_ATIV_CURRIC);
                    if (index !== -1) {
                        if (parseInt(alunoInfo.ANO) > parseInt(alunoData[index].ANO)) {
                            alunoData[index] = alunoInfo;
                        } else if (parseInt(alunoInfo.ANO) === parseInt(alunoData[index].ANO)){
                            if(alunoInfo.PERIODO === "2o. Semestre"){
                                alunoData[index] = alunoInfo;
                            }
                        }
                    } else {
                        alunoData.push(alunoInfo);
                    }

                    // Adicionando ao histórico
                    if (!alunoHistorico[alunoInfo.COD_ATIV_CURRIC]) {
                        alunoHistorico[alunoInfo.COD_ATIV_CURRIC] = [];
                    }
                    alunoHistorico[alunoInfo.COD_ATIV_CURRIC].push(alunoInfo);
                }
            }
    
            if (alunoData.length > 0) {
                var grade = gerarGrade(alunoData);
                $('#grade-curricular').html(grade);
                
                var optativas = gerarOptativas(alunoData);
                $('#lista-optativas').html(optativas);

                // Adicionar evento de clique com botão esquerdo e direito às disciplinas
                adicionarEventosDisciplinas();
            } else {
                alert("Aluno não encontrado");
            }
        });
    }

    function gerarGrade(alunoData) {
        var grade = '';
        gradeCurricular.forEach(function(semestre, index) {
            grade += '<div class="row mb-2">';
            semestre.forEach(function(disciplina) {
                var situacao = alunoData.find(d => d.COD_ATIV_CURRIC === disciplina)?.SITUACAO.toLowerCase() || 'não cursado';
                var cor = '';
                switch (situacao) {
                    case 'aprovado':
                        cor = 'bg-success text-white';
                        break;
                    case 'reprovado por nota':
                    case 'reprovado por frequência':
                        cor = 'bg-danger text-white';
                        break;
                    case 'matrícula':
                        cor = 'bg-primary text-white';
                        break;
                    case 'equivalência de disciplina':
                        cor = 'bg-warning text-black';
                        break;
                    default:
                        cor = 'bg-white text-black';
                        break;
                }
                grade += `<div class="col disciplina ${cor}" data-codigo="${disciplina}" data-toggle="modal" data-target="#popup">${disciplina}</div>`;
            });
            grade += '</div>';
        });
        return grade;
    }

    function gerarOptativas(alunoData) {
        var optativas = '<h2>Disciplinas Optativas</h2>'
        disciplinasOptativas.forEach(function(disciplina) {
            var situacao = alunoData.find(d => d.COD_ATIV_CURRIC === disciplina)?.SITUACAO.toLowerCase() || 'não cursado';
            var cor = '';
            switch (situacao) {
                case 'aprovado':
                    cor = 'bg-success text-white';
                    break;
                case 'reprovado por nota':
                case 'reprovado por frequência':
                    cor = 'bg-danger text-white';
                    break;
                default:
                    cor = 'bg-white text-black';
            }
            optativas += `<div class="col disciplina ${cor}" data-codigo="${disciplina}" data-toggle="modal" data-target="#popup">${disciplina}</div>`;
        });
        return optativas;
    }

    function adicionarEventosDisciplinas() {
        $('.disciplina').on('click', function(event) {
            var codigo = $(this).data('codigo');
            mostrarUltimaInformacaoDisciplina(codigo);
        });

        $('.disciplina').on('contextmenu', function(event) {
            event.preventDefault();
            var codigo = $(this).data('codigo');
            mostrarHistoricoDisciplina(codigo);
            $('#popup').modal('show');
        });
    }

    function mostrarUltimaInformacaoDisciplina(codigo) {
        var ultimaTentativa = alunoData.find(d => d.COD_ATIV_CURRIC === codigo);
        var info = '';
        if (ultimaTentativa) {
            info += `<p><strong>Código/Disciplina:</strong> ${ultimaTentativa.COD_ATIV_CURRIC} / ${ultimaTentativa.NOME_ATIV_CURRIC}</p>`;
            info += `<p><strong>Última vez cursada:</strong> ${ultimaTentativa.ANO} / ${ultimaTentativa.PERIODO}</p>`;
            info += `<p><strong>Nota:</strong> ${ultimaTentativa.MEDIA_FINAL}</p>`;
            info += `<p><strong>Frequência:</strong> ${ultimaTentativa.FREQUENCIA}</p>`;
        } else {
            info = '<p>Informações não encontradas.</p>';
        }
        $('#popup-info').html(info);
        $('#popup').modal('show');
    }

    function mostrarHistoricoDisciplina(codigo) {
        var historico = alunoHistorico[codigo];
        var info = '';
        if (historico) {
            historico.forEach(function(entry) {
                info += `<p><strong>Ano:</strong> ${entry.ANO}</p>`;
                info += `<p><strong>Período:</strong> ${entry.PERIODO}</p>`;
                info += `<p><strong>Nota:</strong> ${entry.MEDIA_FINAL}</p>`;
                info += `<p><strong>Frequência:</strong> ${entry.FREQUENCIA}</p>`;
                info += `<hr>`;
            });
        } else {
            info = '<p>Histórico não encontrado.</p>';
        }
        $('#popup-info').html(info);
        $('#popup').modal('show');
    }
});

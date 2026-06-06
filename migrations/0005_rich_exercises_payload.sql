-- Ingestão em massa dos metadados ricos padrão ExerciseDB para a lista do Fit-Gym

-- PEITO
UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/barbell-bench-press.gif',
  instructions = '["Deite-se no banco plano com os pés firmes no chão.","Segure a barra com uma pegada ligeiramente mais larga que os ombros.","Desça a barra controladamente até o meio do peito e empurre-a explosivamente."] '
WHERE id = 'peito_1';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/dumbbell-bench-press.gif',
  instructions = '["Deite-se no banco segurando os halteres ao lado do peito.","Empurre os halteres para cima estendendo os braços.","Desça controladamente sentindo o peitoral alongar."] '
WHERE id = 'peito_2';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/incline-barbell-press.gif',
  instructions = '["Deite-se no banco inclinado (30° a 45°).","Retire a barra do suporte e desça até a parte superior do peito.","Empurre verticalmente mantendo os cotovelos alinhados."] '
WHERE id = 'peito_3';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/incline-dumbbell-press.gif',
  instructions = '["Sente-se no banco inclinado com um halter em cada mão.","Suba os halteres em linha reta aproximando-os no topo.","Desça abrindo os braços de forma controlada."] '
WHERE id = 'peito_4';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/pec-deck.gif',
  instructions = '["Sente-se no aparelho com as costas bem apoiadas.","Segure as manoplas mantendo os cotovelos levemente flexionados.","Feche os braços à frente do corpo esmagando o peitoral."] '
WHERE id = 'peito_11';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/push-up.gif',
  instructions = '["Posicione as mãos no chão um pouco além da largura dos ombros.","Mantenha o corpo alinhado da cabeça aos pés.","Desça o peito em direção ao solo e empurre para retornar."] '
WHERE id = 'peito_14';

-- COSTAS
UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/lat-pulldown.gif',
  instructions = '["Sente-se no puxador e segure a barra com pegada pronada aberta.","Puxe a barra em direção ao topo do peito, jogando os cotovelos para baixo.","Retorne estendendo os braços por completo."] '
WHERE id = 'costas_1';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/seated-cable-row.gif',
  instructions = '["Sente-se na máquina com os pés apoiados e joelhos levemente flexionados.","Segure o triângulo e puxe em direção ao abdômen.","Mantenha a coluna ereta e esmague as escápulas atrás."] '
WHERE id = 'costas_4';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/dumbbell-row.gif',
  instructions = '["Apoie um joelho e a mão do mesmo lado em um banco plano.","Puxe o halter na direção do quadril mantendo o cotovelo rente ao corpo.","Desça alongando completamente a dorsal."] '
WHERE id = 'costas_9';

-- OMBROS
UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/dumbbell-shoulder-press.gif',
  instructions = '["Sente-se apoiado com os halteres na altura das orelhas.","Empurre os halteres para cima até estender os braços.","Desça devagar até a posição inicial."] '
WHERE id = 'ombros_1';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/dumbbell-lateral-raise.gif',
  instructions = '["Fique em pé com os halteres ao lado do corpo.","Eleve os braços lateralmente até a altura dos ombros, cotovelos semi-flexionados.","Controle a descida segurando o peso."] '
WHERE id = 'ombros_4';

-- BRAÇOS
UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/barbell-curl.gif',
  instructions = '["Em pé, segure a barra com a pegada supinada (palmas para cima).","Flexione os cotovelos trazendo a barra até o peito sem mover os ombros.","Desça controladamente."] '
WHERE id = 'bracos_1';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/incline-dumbbell-curl.gif',
  instructions = '["Sente-se no banco inclinado a 45 graus.","Mantenha os cotovelos fixos para trás e flexione os braços isolando o bíceps.","Retorne à posição inicial."] '
WHERE id = 'bracos_4';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/triceps-pushdown.gif',
  instructions = '["De frente para a polia alta, segure a barra ou corda com os cotovelos colados ao corpo.","Empurre o peso para baixo estendendo os braços totalmente.","Retorne devagar."] '
WHERE id = 'bracos_11';

-- PERNAS
UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/barbell-squat.gif',
  instructions = '["Apoie a barra sobre o trapézio e afaste os pés na largura dos ombros.","Agache projetando o quadril para trás, mantendo os joelhos alinhados com os pés.","Suba empurrando o chão."] '
WHERE id = 'pernas_1';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/leg-press-45.gif',
  instructions = '["Posicione os pés na plataforma na largura dos ombros.","Destrave a máquina e flexione os joelhos até 90 graus.","Empurre a plataforma sem travar os joelhos no final."] '
WHERE id = 'pernas_4';

UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/leg-extension.gif',
  instructions = '["Sente-se na cadeira extensora com o rolo ajustado sobre o tornozelo.","Estenda as pernas completamente contraindo os quadríceps.","Retorne controlando a carga."] '
WHERE id = 'pernas_6';

-- CORE
UPDATE exercises SET 
  gifUrl = 'https://assets.animatedgifs.org/gifs/crunch.gif',
  instructions = '["Deite-se de costas com os joelhos flexionados e pés no chão.","Contraia o abdômen elevando os ombros do solo.","Mantenha o pescoço relaxado e retorne."] '
WHERE id = 'core_1';

-- Atualiza a base para o formato ExerciseDB utilizando a sintaxe UPSERT (INSERT ... ON CONFLICT DO UPDATE)
INSERT INTO exercises (id, name, muscleId, equipment, gifUrl, instructions) VALUES
('peito_1', 'Supino Reto com Barra', 'chest', 'barbell', 'https://assets.animatedgifs.org/gifs/barbell-bench-press.gif', '["Deite-se no banco plano com os pés firmes no chão.","Segure a barra com uma pegada ligeiramente mais larga que os ombros.","Desça a barra controladamente até o meio do peito e empurre-a explosivamente para cima."]'),

('peito_2', 'Supino Reto com Halteres', 'chest', 'dumbbell', 'https://assets.animatedgifs.org/gifs/dumbbell-bench-press.gif', '["Deite-se no banco segurando os halteres ao lado do peito.","Empurre os halteres para cima estendendo os braços, sem travar os cotovelos.","Desça controladamente sentindo o peitoral alongar."]'),

('costas_1', 'Puxada Alta Pronada (Pulldown)', 'back', 'cable', 'https://assets.animatedgifs.org/gifs/lat-pulldown.gif', '["Sente-se no puxador e ajuste o apoio das coxas.","Segure a barra com pegada pronada bem aberta.","Puxe a barra em direção ao topo do peito, jogando os cotovelos para baixo e para trás."]'),

('bracos_4', 'Rosca Inclinada com Halteres (Banco 45°)', 'biceps', 'dumbbell', 'https://assets.animatedgifs.org/gifs/incline-dumbbell-curl.gif', '["Sente-se em um banco inclinado a 45 graus com um halter em cada mão.","Mantenha os cotovelos fixos e próximos ao corpo.","Gire as palmas das mãos para cima enquanto flexiona os braços, esmagando o bíceps no topo."]'),

('pernas_4', 'Leg Press 45°', 'quads', 'machine', 'https://assets.animatedgifs.org/gifs/leg-press-45.gif', '["Posicione os pés na plataforma na largura dos ombros.","Destrave a máquina de segurança com cuidado.","Flexione os joelhos até um ângulo de 90 graus, evitando que a lombar saia do encosto, e empurre novamente."]')
ON CONFLICT(id) DO UPDATE SET
    gifUrl = excluded.gifUrl,
    instructions = excluded.instructions;

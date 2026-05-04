import 'dotenv/config';
import './server';
import { prisma } from './services/db';

async function bootstrap() {
  console.log("🚀 [EconomiaDaily] Iniciando motores...");

  try {
    // Teste de conexão com o Neon
    await prisma.$connect();
    console.log("✅ Conexão com Neon DB: OK");

    // Agora sim, importamos o scheduler para ele começar a contar o tempo
    console.log("📅 Agendador de tarefas carregado.");
    await import('./scheduler'); 

  } catch (error) {
    console.error("❌ Falha catastrófica na inicialização:");
    console.error(error);
    process.exit(1);
  }
}

bootstrap();    

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
    console.log('\n=== Cleaning Up Development Environment ===\n');

    // 1. Remove wallets directory
    const walletsDir = path.join(process.cwd(), 'wallets');
    if (fs.existsSync(walletsDir)) {
        console.log('Removing wallets directory...');
        fs.rmSync(walletsDir, { recursive: true, force: true });
    }

    // 2. Remove deployment.json
    const deploymentFile = path.join(__dirname, 'deployment.json');
    if (fs.existsSync(deploymentFile)) {
        console.log('Removing deployment configuration...');
        fs.unlinkSync(deploymentFile);
    }

    // 3. Reset .env file from .env.example
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envExamplePath)) {
        console.log('Resetting .env file from .env.example...');
        const envExample = fs.readFileSync(envExamplePath, 'utf-8');
        fs.writeFileSync(envPath, envExample);
    }

    // 4. Clean any test artifacts
    const testArtifacts = [
        'coverage',
        '.nyc_output',
        'junit.xml'
    ];

    for (const artifact of testArtifacts) {
        const artifactPath = path.join(process.cwd(), artifact);
        if (fs.existsSync(artifactPath)) {
            console.log(`Removing test artifact: ${artifact}...`);
            fs.rmSync(artifactPath, { recursive: true, force: true });
        }
    }

    console.log('\n✓ Cleanup completed successfully!');
    console.log('Ready for fresh deployment.');
}

// Run cleanup
cleanup().catch(console.error); 
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress
} from '@mui/material';
import WebApp from '@twa-dev/sdk';


const ImportWalletPage: React.FC = () => {
    const [mnemonic, setMnemonic] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const importWallet = async (mnemonic: string) => {
        setLoading(true);
        setError(null);
        try {
            WebApp.CloudStorage.setItem('tura_mnemonic', mnemonic);
            navigate('/wallet');
        } catch (error) {
            console.error('Error importing wallet:', error);
            setError('Failed to import wallet. Please check your mnemonic and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = () => {
        if (mnemonic.trim()) {
            importWallet(mnemonic.trim());
        }
    };

    return (
        <Box sx={{bgcolor: '#1a1a1a', color: '#ffffff', minHeight: '100vh', p: 2}}>
            <Paper elevation={3} sx={{bgcolor: '#2a2a2a', p: 3, borderRadius: 2}}>
                <Typography variant="h5" gutterBottom align="center">
                    Import Wallet
                </Typography>
                <Typography variant="body1" gutterBottom align="center" sx={{mb: 3}}>
                    Enter your mnemonic phrase to import your wallet:
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    placeholder="Enter your mnemonic phrase..."
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {borderColor: '#4a4a4a'},
                            '&:hover fieldset': {borderColor: '#6a6a6a'},
                            '&.Mui-focused fieldset': {borderColor: '#8a8a8a'},
                        },
                        '& .MuiInputBase-input': {color: '#ffffff'},
                    }}
                />
                {error && (
                    <Typography color="error" sx={{mb: 2}}>
                        {error}
                    </Typography>
                )}
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/wallet')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleImport}
                        disabled={!mnemonic.trim() || loading}
                    >
                        {loading ? <CircularProgress size={24}/> : 'Import'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ImportWalletPage;
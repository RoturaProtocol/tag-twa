import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    styled
} from '@mui/material';
import {SigningStargateClient, StdFee} from '@cosmjs/stargate';
import {DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {stringToPath} from '@cosmjs/crypto';
import {coins} from '@cosmjs/proto-signing';
import WebApp from '@twa-dev/sdk';

// Styled components for dark theme
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
    '& .MuiToggleButtonGroup-grouped': {
        margin: theme.spacing(0.5),
        border: 0,
        '&.Mui-disabled': {
            border: 0,
        },
        '&:not(:first-of-type)': {
            borderRadius: theme.shape.borderRadius,
        },
        '&:first-of-type': {
            borderRadius: theme.shape.borderRadius,
        },
    },
}));

const StyledToggleButton = styled(ToggleButton)(() => ({
    color: '#ffffff',
    backgroundColor: '#424242',
    '&.Mui-selected': {
        color: '#ffffff',
        backgroundColor: '#1976d2',
    },
    '&:hover': {
        backgroundColor: '#616161',
    },
    '&.Mui-selected:hover': {
        backgroundColor: '#1565c0',
    },
}));

interface TokenTransferProps {
    open: boolean;
    onClose: () => void;
    tokenSymbol: string;
    address: string;
    balance: string;
    mnemonic: string;
}

const TURA_RPC_ENDPOINT = "https://rpc-beta1.turablockchain.com";
const TURA_PREFIX = "tura";
const TURA_COIN_TYPE = "118";
const DEFAULT_GAS_LIMIT = 100000;

const GAS_FEES = {
    low: 0.000007,
    medium: 0.000018,
    high: 0.000029
};

const TokenTransfer: React.FC<TokenTransferProps> = ({
                                                         open,
                                                         onClose,
                                                         tokenSymbol,
                                                         address,
                                                         balance,
                                                         mnemonic,
                                                     }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [gasFeeLevel, setGasFeeLevel] = useState<'low' | 'medium' | 'high'>('medium');

    const calculateFee = (selectedFee: number): number => {
        return Math.ceil(selectedFee * 100000000);
    };

    const handleTransfer = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            console.log('Starting transfer process');
            const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix: TURA_PREFIX,
                hdPaths: [stringToPath(`m/44'/${TURA_COIN_TYPE}'/0'/0/0`)],
            });

            console.log('Wallet created successfully');

            const client = await SigningStargateClient.connectWithSigner(TURA_RPC_ENDPOINT, wallet);
            console.log('Connected to SigningStargateClient');

            const denom = tokenSymbol === 'TURA' ? 'utura' : 'utags';
            const transferAmount = Math.floor(parseFloat(amount) * 100000000);
            console.log(`Transfer amount: ${transferAmount} ${denom}`);

            if (isNaN(transferAmount) || transferAmount <= 0) {
                throw new Error('Invalid transfer amount');
            }

            const gasFeeAmount = calculateFee(GAS_FEES[gasFeeLevel]);

            const fee: StdFee = {
                amount: coins(gasFeeAmount, 'utura'),
                gas: DEFAULT_GAS_LIMIT.toString(),
            };

            console.log(`Sending transaction with fee: ${JSON.stringify(fee)}`);

            const result = await client.sendTokens(
                address,
                recipient,
                coins(transferAmount, denom),
                fee,
                "Transfer from Tag Fusion TWA"
            );

            console.log(`Raw transaction result:`, result);

            // Assume the transaction was successful if we get here
            setSuccessMessage(`Transfer of ${amount} ${tokenSymbol} to ${recipient} was successful. Transaction hash: ${result.transactionHash}`);
            WebApp.showAlert(`Transfer successful! Transaction hash: ${result.transactionHash}`);
        } catch (err) {
            console.error('Transfer error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            if (errorMessage.includes('Invalid string. Length must be a multiple of 4')) {
                // The transaction might have been successful, but we can't parse the response
                setSuccessMessage(`Transfer of ${amount} ${tokenSymbol} to ${recipient} transaction has been sent. Please check your balance.`);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const estimatedFee = GAS_FEES[gasFeeLevel].toFixed(6);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                style: {
                    backgroundColor: '#2a2a2a',
                    color: '#ffffff',
                    minWidth: '300px',
                }
            }}
        >
            <DialogTitle>{`Transfer ${tokenSymbol}`}</DialogTitle>
            <DialogContent>
                <Box mb={2}>
                    <Typography variant="body2">Available Balance: {balance} {tokenSymbol}</Typography>
                </Box>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Recipient Address"
                    type="text"
                    fullWidth
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    InputProps={{style: {color: '#ffffff'}}}
                    InputLabelProps={{style: {color: '#aaaaaa'}}}
                />
                <TextField
                    margin="dense"
                    label="Amount"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    InputProps={{style: {color: '#ffffff'}}}
                    InputLabelProps={{style: {color: '#aaaaaa'}}}
                />
                <Box mt={2}>
                    <Typography variant="body2" gutterBottom>Gas Fee</Typography>
                    <StyledToggleButtonGroup
                        value={gasFeeLevel}
                        exclusive
                        onChange={(_, newValue) => newValue && setGasFeeLevel(newValue)}
                        aria-label="gas fee"
                        fullWidth
                    >
                        <StyledToggleButton value="low" aria-label="low">
                            Low ({GAS_FEES.low} TURA)
                        </StyledToggleButton>
                        <StyledToggleButton value="medium" aria-label="medium">
                            Medium ({GAS_FEES.medium} TURA)
                        </StyledToggleButton>
                        <StyledToggleButton value="high" aria-label="high">
                            High ({GAS_FEES.high} TURA)
                        </StyledToggleButton>
                    </StyledToggleButtonGroup>
                </Box>
                <Box mt={2}>
                    <Typography variant="body2" gutterBottom>Fee: {estimatedFee} TURA</Typography>
                </Box>
                {error && (
                    <Typography color="error" variant="body2" style={{marginTop: '8px'}}>
                        {error}
                    </Typography>
                )}
                {successMessage && (
                    <Typography color="success" variant="body2" style={{marginTop: '8px'}}>
                        {successMessage}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} style={{color: '#ffffff'}}>
                    Close
                </Button>
                <Button
                    onClick={handleTransfer}
                    style={{color: '#ffffff'}}
                    disabled={loading || !recipient || !amount || successMessage !== null}
                >
                    {loading ? <CircularProgress size={24}/> : 'Transfer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TokenTransfer;
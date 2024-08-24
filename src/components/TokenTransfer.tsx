import React, { useState } from 'react';
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
    FormControlLabel,
    Switch,
    InputAdornment
} from '@mui/material';
import { SigningStargateClient, StdFee } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { stringToPath } from '@cosmjs/crypto';
import { coins } from '@cosmjs/proto-signing';
import WebApp from '@twa-dev/sdk';

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
const DEFAULT_GAS_PRICE = 0.025; // in TURA
const DEFAULT_GAS_LIMIT = 200000;

const TokenTransfer: React.FC<TokenTransferProps> = ({ open, onClose, tokenSymbol, address, balance, mnemonic }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoGas, setAutoGas] = useState(true);
    const [manualGasLimit, setManualGasLimit] = useState(DEFAULT_GAS_LIMIT.toString());
    const [manualGasPrice, setManualGasPrice] = useState(DEFAULT_GAS_PRICE.toString());

    const handleTransfer = async () => {
        setLoading(true);
        setError(null);

        try {
            const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix: TURA_PREFIX,
                hdPaths: [stringToPath(`m/44'/${TURA_COIN_TYPE}'/0'/0/0`)],
            });

            const client = await SigningStargateClient.connectWithSigner(TURA_RPC_ENDPOINT, wallet);

            const denom = tokenSymbol === 'TURA' ? 'utura' : 'utags';
            const transferAmount = coins(Math.floor(parseFloat(amount) * 1000000), denom);

            let gasLimit: number;
            let gasPrice: string;

            if (autoGas) {
                // Estimate the gas
                gasLimit = await client.simulate(address, [{
                    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                    value: {
                        fromAddress: address,
                        toAddress: recipient,
                        amount: transferAmount
                    }
                }], "");
                gasLimit = Math.round(gasLimit * 1.3); // Add a 30% buffer
                gasPrice = `${DEFAULT_GAS_PRICE}${denom}`;
            } else {
                gasLimit = parseInt(manualGasLimit);
                gasPrice = `${manualGasPrice}${denom}`;
            }

            const fee: StdFee = {
                amount: coins(Math.round(gasLimit * parseFloat(gasPrice) * 1000000), denom),
                gas: gasLimit.toString(),
            };

            const result = await client.sendTokens(address, recipient, transferAmount, fee, "");

            WebApp.showAlert(`Transfer successful! Transaction hash: ${result.transactionHash}`);
            onClose();
        } catch (err) {
            console.error('Transfer error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ style: { backgroundColor: '#2a2a2a', color: '#ffffff' } }}>
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
                    InputProps={{ style: { color: '#ffffff' } }}
                    InputLabelProps={{ style: { color: '#aaaaaa' } }}
                />
                <TextField
                    margin="dense"
                    label="Amount"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    InputProps={{ style: { color: '#ffffff' } }}
                    InputLabelProps={{ style: { color: '#aaaaaa' } }}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={autoGas}
                            onChange={(e) => setAutoGas(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Automatic Gas"
                />
                {!autoGas && (
                    <>
                        <TextField
                            margin="dense"
                            label="Gas Limit"
                            type="number"
                            fullWidth
                            value={manualGasLimit}
                            onChange={(e) => setManualGasLimit(e.target.value)}
                            InputProps={{ style: { color: '#ffffff' } }}
                            InputLabelProps={{ style: { color: '#aaaaaa' } }}
                        />
                        <TextField
                            margin="dense"
                            label="Gas Price"
                            type="number"
                            fullWidth
                            value={manualGasPrice}
                            onChange={(e) => setManualGasPrice(e.target.value)}
                            InputProps={{
                                style: { color: '#ffffff' },
                                endAdornment: <InputAdornment position="end">{tokenSymbol.toLowerCase()}</InputAdornment>
                            }}
                            InputLabelProps={{ style: { color: '#aaaaaa' } }}
                        />
                    </>
                )}
                {error && (
                    <Typography color="error" variant="body2" style={{ marginTop: '8px' }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleTransfer} color="primary" disabled={loading || !recipient || !amount}>
                    {loading ? <CircularProgress size={24} /> : 'Transfer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TokenTransfer;
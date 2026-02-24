import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, TextInput } from 'react-native';
import io from 'socket.io-client';
import WalkingAnim from "../components/walking_anim";
import LogoAnim from "../components/logo-anim";

// REPLACE THIS WITH YOUR DEVICE'S IP ADDRESS
// const SOCKET_URL = 'http://192.168.x.x:3000';
const SOCKET_URL = 'http://192.168.1.13:3000';

export default function App() {
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('Disconnected');
    const [teamName, setTeamName] = useState('Team Alpha');
    const [betAmount, setBetAmount] = useState('50');

    // Connects the client to the server
    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);
        // === EVENT LISTENERS
        // If successful, updates status to connected
        newSocket.on('connect', () => {
            setStatus('Connected to Server');
            console.log('Connected to Server!');
        });
        // Else, updates status to show error
        newSocket.on('connect_error', (err) => {
            setStatus('Connection Failed: ' + err.message);
            console.log('Connection Error: ', err);
        });
        // Alerts you whenever a bet is made by any user
        newSocket.on('new_bet_alert', (data) => {
            Alert.alert('Live Update: ', data.message);
        });
        
        return () => newSocket.disconnect();
    }, []);
    
    // Sending event (placing bet)
    const placeBet = () => {
        if(socket){
            const amount = parseInt(betAmount);
            socket.emit('place_bet', { team: teamName, amount: amount });
        }
    };

    return (
        
        <View style={styles.container}>
            <WalkingAnim />
            <LogoAnim />
        <Text style={styles.title}>Prophetize Beta</Text>
        
        <Text style={styles.status}>Status: {status}</Text>

        <View style={styles.inputContainer}>
            <Text>Team Name:</Text>
            <TextInput 
            style={styles.input} 
            value={teamName} 
            onChangeText={setTeamName} 
            />

            <Text>Bet Amounttttttttttttttttt: </Text>
            <TextInput 
            style={styles.input} 
            value={betAmount} 
            keyboardType="numeric"
            onChangeText={setBetAmount} 
            />
        </View>
            
        <Button title="Place Bet" onPress={placeBet} />
        <StatusBar style="auto" />
        </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    status: { fontSize: 16, color: 'blue', marginBottom: 20 },
    inputContainer: { width: '100%', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, width: '100%' },
});
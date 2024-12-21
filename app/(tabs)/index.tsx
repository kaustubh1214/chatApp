import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Linking
} from 'react-native';
import axios from 'axios';

interface ChatMessage {
  type: 'question' | 'answer';
  content: string;
}

const App = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory, generatingAnswer]);

  // API Key - should be moved to environment variables in production
  const apiKey = "AIzaSyCrT399dbKfxUCSUdtdUE-hd9eNNUV7xG8";

  const generateAnswer = async () => {
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion('');

    setChatHistory(prev => [...prev, { type: 'question', content: currentQuestion }]);

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: currentQuestion }] }],
        },
      });

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      setChatHistory(prev => [...prev, { type: 'answer', content: aiResponse }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { 
        type: 'answer', 
        content: "Sorry - Something went wrong. Please try again!" 
      }]);
    }
    setGeneratingAnswer(false);
  };

  const WelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome to Shinde's AI! 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          I'm here to help you with anything you'd like to know. You can ask me about:
        </Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <Text>💡 General knowledge</Text>
          </View>
          <View style={styles.featureItem}>
            <Text>🔧 Technical questions</Text>
          </View>
          <View style={styles.featureItem}>
            <Text>📝 Writing assistance</Text>
          </View>
          <View style={styles.featureItem}>
            <Text>🤔 Problem solving</Text>
          </View>
        </View>
        <Text style={styles.welcomeFooter}>
          Just type your question below and press Send!
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <TouchableOpacity 
          onPress={() => Linking.openURL('https://github.com/Vishesh-Pandey/chat-ai')}
          style={styles.header}
        >
          <Text style={styles.headerText}>Shinde's AI</Text>
        </TouchableOpacity>

        {/* Chat Container */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {chatHistory.length === 0 ? (
            <WelcomeScreen />
          ) : (
            chatHistory.map((chat, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageContainer,
                  chat.type === 'question' ? styles.questionContainer : styles.answerContainer
                ]}
              >
                <View style={[
                  styles.messageBubble,
                  chat.type === 'question' ? styles.questionBubble : styles.answerBubble
                ]}>
                  <Text style={chat.type === 'question' ? styles.questionText : styles.answerText}>
                    {chat.content}
                  </Text>
                </View>
              </View>
            ))
          )}
          {generatingAnswer && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4B9EF6" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask anything..."
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, generatingAnswer && styles.sendButtonDisabled]}
            onPress={generateAnswer}
            disabled={generatingAnswer}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B9EF6',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
  },
  chatContent: {
    padding: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcomeContent: {
    backgroundColor: '#F0F8FF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B9EF6',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresGrid: {
    marginVertical: 16,
  },
  featureItem: {
    backgroundColor: 'white',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeFooter: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  questionContainer: {
    alignItems: 'flex-end',
  },
  answerContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  questionBubble: {
    backgroundColor: '#4B9EF6',
    borderBottomRightRadius: 0,
  },
  answerBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 0,
  },
  questionText: {
    color: 'white',
  },
  answerText: {
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4B9EF6',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
import React, { useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Typography,
  Stack,
  Divider,
  InputAdornment,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

export default function ChatCard({
  me,
  chatExpenses,
  chatMessage,
  setChatMessage,
  onSubmitChat,
}) {
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatExpenses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      onSubmitChat();
    }
  };

  const isMyMessage = (message) => {
    return message?.sender === me?.userData?._id;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.2),
              width: 40,
              height: 40,
            }}
          >
            💬
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              แชทการเบิกจ่าย
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {chatExpenses?.rows?.length || 0} ข้อความ
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: alpha(theme.palette.grey[100], 0.3),
          backgroundImage: `linear-gradient(${alpha(
            theme.palette.primary.main,
            0.02,
          )} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
            theme.palette.primary.main,
            0.02,
          )} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      >
        <Stack spacing={2}>
          {chatExpenses?.rows?.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">ยังไม่มีข้อความ</Typography>
              <Typography variant="caption">
                เริ่มต้นการสนทนาเกี่ยวกับการเบิกจ่ายนี้
              </Typography>
            </Box>
          ) : (
            chatExpenses?.rows?.map((chat, index) => {
              const isMine = isMyMessage(chat);
              return (
                <Box
                  key={chat._id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                  }}
                >
                  {!isMine && (
                    <Avatar
                      src={chat?.user?.image?.url}
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1,
                        bgcolor: theme.palette.primary.light,
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  )}

                  <Box
                    sx={{
                      maxWidth: '70%',
                      minWidth: 100,
                    }}
                  >
                    {!isMine && (
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 1,
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        {chat?.user?.firstname} {chat?.user?.lastname}
                        {chat?.user?.department?.name && (
                          <Chip
                            label={chat.user.department.name}
                            size="small"
                            sx={{
                              ml: 0.5,
                              height: 18,
                              fontSize: '0.65rem',
                            }}
                          />
                        )}
                      </Typography>
                    )}

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mt: 0.5,
                        bgcolor: isMine
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                        color: isMine
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                        borderRadius: isMine
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        border: isMine
                          ? 'none'
                          : `1px solid ${theme.palette.divider}`,
                        boxShadow: isMine
                          ? `0 2px 8px ${alpha(
                              theme.palette.primary.main,
                              0.3,
                            )}`
                          : `0 1px 4px ${alpha(
                              theme.palette.common.black,
                              0.05,
                            )}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {chat?.message}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ mt: 0.5 }}
                      >
                        <TimeIcon
                          sx={{
                            fontSize: 12,
                            opacity: isMine ? 0.8 : 0.6,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            opacity: isMine ? 0.8 : 0.6,
                          }}
                        >
                          {dayjs(chat?.createdAt)
                            .locale('th')
                            .format('DD/MM/YY HH:mm')}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Box>

                  {isMine && (
                    <Avatar
                      src={me?.userData?.image?.url}
                      sx={{
                        width: 32,
                        height: 32,
                        ml: 1,
                        bgcolor: theme.palette.secondary.light,
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  )}
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      <Divider />

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="พิมพ์ข้อความ..."
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          multiline
          maxRows={3}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  disabled={!chatMessage.trim()}
                  sx={{
                    bgcolor: chatMessage.trim()
                      ? theme.palette.primary.main
                      : theme.palette.action.disabledBackground,
                    color: chatMessage.trim()
                      ? theme.palette.primary.contrastText
                      : theme.palette.action.disabled,
                    '&:hover': {
                      bgcolor: chatMessage.trim()
                        ? theme.palette.primary.dark
                        : theme.palette.action.disabledBackground,
                    },
                    '&.Mui-disabled': {
                      color: theme.palette.action.disabled,
                    },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: 'block' }}
        >
          กด Enter เพื่อส่งข้อความ
        </Typography>
      </Box>
    </Paper>
  );
}

package com.example.futbol90pro.presentation

import android.content.Context
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.KeyEvent
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.cos
import kotlin.math.sin

data class MatchEvent(
    val minuteLabel: String,
    val team: String,
    val type: String,
    val playerNo: String,
    val detail: String = ""
)

data class SavedMatch(
    val id: String,
    val date: String,
    val category: String,
    val homeTeam: String,
    val awayTeam: String,
    val homeScore: Int,
    val awayScore: Int,
    val events: List<MatchEvent>
)

@Composable
fun EventItemViewReadOnly(ev: MatchEvent, teamColor: Color) {
    val icon = when(ev.type) { "GOL" -> "⚽"; "SARI KART" -> "🟨"; "KIRMIZI KART" -> "🟥"; else -> "" }
    val detailFull = ev.detail 
    val numberColor = if (ev.team == "EV SAHİBİ") Color.Black else Color.White
    val isFieldPlayer = ev.playerNo.toIntOrNull() != null

    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp, horizontal = 16.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            if (isFieldPlayer) {
                Box(modifier = Modifier.size(50.dp), contentAlignment = Alignment.Center) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val w = size.width; val h = size.height
                        val path = androidx.compose.ui.graphics.Path().apply {
                            moveTo(w * 0.3f, h * 0.05f); lineTo(w * 0.7f, h * 0.05f) 
                            lineTo(w * 0.95f, h * 0.35f); lineTo(w * 0.85f, h * 0.5f) 
                            lineTo(w * 0.75f, h * 0.4f); lineTo(w * 0.75f, h * 0.95f) 
                            lineTo(w * 0.25f, h * 0.95f); lineTo(w * 0.25f, h * 0.4f) 
                            lineTo(w * 0.15f, h * 0.5f); lineTo(w * 0.05f, h * 0.35f) 
                            close()
                        }
                        drawPath(path, color = teamColor)
                    }
                    Text(text = ev.playerNo, color = numberColor, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }
            } else {
                Box(modifier = Modifier.size(50.dp).background(Color(0xFF444444), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                    Text(text = ev.playerNo, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, lineHeight = 12.sp)
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "${ev.minuteLabel}'", color = Color.Cyan, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    if (detailFull.isNotEmpty()) { Text(text = detailFull, color = Color.LightGray, fontSize = 13.sp, fontWeight = FontWeight.Bold) }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = "${ev.type} $icon", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.End)
            }
        }
        Spacer(Modifier.height(8.dp))
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(Color.DarkGray))
    }
}

class MainActivity : ComponentActivity() {

    private var matchState by mutableStateOf(0) 
    private var halfDuration by mutableStateOf(45) 
    
    private var matchCategory by mutableStateOf("Kategori Seç")
    private var homeTeamName by mutableStateOf("BALÇOVASPOR")
    private var awayTeamName by mutableStateOf("NARLIDERE")
    
    private var isMatchActive by mutableStateOf(false)
    private var isPaused by mutableStateOf(false)
    private var isFrozen by mutableStateOf(false) 
    
    private var isScreenLocked by mutableStateOf(false)
    private var lastLockToggleTime = 0L
    
    private var hasFirstHalfStarted by mutableStateOf(false)
    private var hasSecondHalfStarted by mutableStateOf(false)
    
    private var mainTime by mutableStateOf(0)
    private var lostTime by mutableStateOf(0)
    private var addedTime by mutableStateOf(0)
    private var halftimeBreakTime by mutableStateOf(15 * 60)
    
    private var awardedStoppageTime by mutableStateOf(0)

    private var homeScore by mutableStateOf(0)
    private var awayScore by mutableStateOf(0)

    private var activeMenuState by mutableStateOf(0)
    private var pendingTeam by mutableStateOf("")
    private var pendingAction by mutableStateOf("")
    private var pendingPlayerNo by mutableStateOf("")

    private val matchEvents = mutableStateListOf<MatchEvent>()
    private var doubleYellowWarningPlayer by mutableStateOf("")

    private var isSubCountdownActive by mutableStateOf(false)
    private var subCountdownValue by mutableStateOf(10)
    private var isPenaltyActive by mutableStateOf(false)
    private var penaltyValue by mutableStateOf(60)

    private var toneGenerator: ToneGenerator? = null
    private var vibrator: Vibrator? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private val matchScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private var lastTickTime = 0L

    private var showStoppageTimer by mutableStateOf(false)
    private var stoppageTimeRemaining by mutableStateOf(0)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) 

        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vm = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vm.defaultVibrator
        } else {
            @Suppress("DEPRECATION") getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Futbol90Pro::TimerWakeLock")
        wakeLock?.acquire(4 * 60 * 60 * 1000L) 

        toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100)

        matchScope.launch {
            lastTickTime = SystemClock.elapsedRealtime()
            while (isActive) {
                delay(250) 
                val now = SystemClock.elapsedRealtime()
                val delta = now - lastTickTime
                if (delta >= 1000) {
                    val secondsToTick = (delta / 1000).toInt()
                    lastTickTime += secondsToTick * 1000L
                    for (i in 0 until secondsToTick) { tickOneSecond() }
                }
            }
        }

        setContent { MaterialTheme { HakemSaatiTasarim() } }
    }

    override fun onDestroy() {
        super.onDestroy()
        matchScope.cancel() 
        toneGenerator?.release()
        if (wakeLock?.isHeld == true) wakeLock?.release()
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN && event.repeatCount == 0) {
            val keyCode = event.keyCode
            if (keyCode != KeyEvent.KEYCODE_BACK && keyCode != KeyEvent.KEYCODE_HOME && keyCode != KeyEvent.KEYCODE_POWER) {
                if (isScreenLocked) return true 
                if ((matchState == 1 || matchState == 3 || isPaused) && activeMenuState == 0 && !isFrozen && !isSubCountdownActive) {
                    val isPeriodStarted = if (matchState == 1) hasFirstHalfStarted else if (matchState == 3) hasSecondHalfStarted else false
                    if (isPeriodStarted) { togglePause() }
                    return true 
                }
            }
        }
        return super.dispatchKeyEvent(event)
    }

    private fun saveMatchToArchive() {
        if (matchEvents.isEmpty() && homeScore == 0 && awayScore == 0) return
        try {
            val prefs = getSharedPreferences("MatchArchive", Context.MODE_PRIVATE)
            val matchesArray = JSONArray(prefs.getString("matches", "[]") ?: "[]")
            val newMatch = JSONObject()
            newMatch.put("id", System.currentTimeMillis().toString())
            newMatch.put("date", SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(Date()))
            newMatch.put("category", matchCategory)
            newMatch.put("homeTeam", homeTeamName)
            newMatch.put("awayTeam", awayTeamName)
            newMatch.put("homeScore", homeScore)
            newMatch.put("awayScore", awayScore)
            val eventsArray = JSONArray()
            matchEvents.forEach { ev ->
                val evObj = JSONObject()
                evObj.put("minuteLabel", ev.minuteLabel); evObj.put("team", ev.team)
                evObj.put("type", ev.type); evObj.put("playerNo", ev.playerNo)
                evObj.put("detail", ev.detail); eventsArray.put(evObj)
            }
            newMatch.put("events", eventsArray)
            matchesArray.put(newMatch)
            prefs.edit().putString("matches", matchesArray.toString()).apply()
        } catch (e: Exception) { e.printStackTrace() }
    }

    private fun loadMatchesFromArchive(context: Context): List<SavedMatch> {
        val result = mutableListOf<SavedMatch>()
        try {
            val prefs = context.getSharedPreferences("MatchArchive", Context.MODE_PRIVATE)
            val matchesArray = JSONArray(prefs.getString("matches", "[]") ?: "[]")
            for (i in 0 until matchesArray.length()) {
                val matchObj = matchesArray.getJSONObject(i)
                val eventsArray = matchObj.getJSONArray("events")
                val events = mutableListOf<MatchEvent>()
                for (j in 0 until eventsArray.length()) {
                    val evObj = eventsArray.getJSONObject(j)
                    events.add(MatchEvent(
                        minuteLabel = evObj.getString("minuteLabel"), team = evObj.getString("team"),
                        type = evObj.getString("type"), playerNo = evObj.getString("playerNo"), detail = evObj.getString("detail")
                    ))
                }
                result.add(SavedMatch(
                    id = matchObj.getString("id"), date = matchObj.getString("date"),
                    category = if (matchObj.has("category")) matchObj.getString("category") else "Bilinmeyen",
                    homeTeam = if (matchObj.has("homeTeam")) matchObj.getString("homeTeam") else "Ev Sahibi",
                    awayTeam = if (matchObj.has("awayTeam")) matchObj.getString("awayTeam") else "Misafir",
                    homeScore = matchObj.getInt("homeScore"), awayScore = matchObj.getInt("awayScore"), events = events
                ))
            }
        } catch (e: Exception) { e.printStackTrace() }
        return result.reversed()
    }

    private fun titret(sureMs: Long) {
        vibrator?.let {
            if (it.hasVibrator()) it.vibrate(VibrationEffect.createOneShot(sureMs, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    }

    private fun titretUyari() {
        vibrator?.let {
            if (it.hasVibrator()) {
                val pattern = longArrayOf(0, 200, 150, 200, 150, 500, 600, 200, 150, 200, 150, 500, 600, 200, 150, 200, 150, 500)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) it.vibrate(VibrationEffect.createWaveform(pattern, -1))
                else @Suppress("DEPRECATION") it.vibrate(pattern, -1)
            }
        }
    }

    private fun titretCezaBitis() {
        vibrator?.let {
            if (it.hasVibrator()) {
                val pattern = longArrayOf(0, 100, 100, 100, 100, 100, 100, 800) 
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) it.vibrate(VibrationEffect.createWaveform(pattern, -1))
                else @Suppress("DEPRECATION") it.vibrate(pattern, -1)
            }
        }
    }

    private fun tickOneSecond() {
        if (isSubCountdownActive) {
            if (subCountdownValue > 0) {
                subCountdownValue--
                if (subCountdownValue == 0) {
                    titret(1000)
                    toneGenerator?.startTone(ToneGenerator.TONE_CDMA_HIGH_L, 800) 
                    matchScope.launch { delay(1500); isSubCountdownActive = false }
                } else if (subCountdownValue <= 3) {
                    titret(300)
                    toneGenerator?.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 200) 
                } else {
                    titret(100)
                    toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP, 100) 
                }
            }
        }

        if (isPenaltyActive) {
            if (penaltyValue > 0) {
                penaltyValue--
                if (penaltyValue == 0) { 
                    vibrator?.let {
                        if (it.hasVibrator()) {
                            val pattern = longArrayOf(0, 100, 100, 100, 100, 100, 100, 800) 
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) it.vibrate(VibrationEffect.createWaveform(pattern, -1))
                            else @Suppress("DEPRECATION") it.vibrate(pattern, -1)
                        }
                    }
                }
            }
        }

        if (matchState == 2) { 
            if (halftimeBreakTime > 0) halftimeBreakTime-- else handleNextState()
        } else if (isMatchActive && !isFrozen) {
            val limit = if (matchState == 1) halfDuration * 60 else (halfDuration * 2) * 60
            
            mainTime++
            if (isPaused) { lostTime++ }
            
            if (mainTime > limit) { 
                addedTime++
                if (addedTime == lostTime && lostTime > 0 && !isPaused) titret(1500) 
            }
            
            val warningTime1 = limit - (3 * 60)
            val warningTime2 = limit - (2 * 60)
            if ((mainTime == warningTime1 || mainTime == warningTime2) && !isPaused) titretUyari()
        }
    }

    private fun togglePause() {
        if (matchState == 2 || matchState == 0 || matchState == 12 || isFrozen || activeMenuState != 0) return
        if (!isMatchActive) { isMatchActive = true; isPaused = false } 
        else { isPaused = !isPaused }
        titret(100)
    }

    private fun handleNextState() {
        if (matchState == 1) {
            matchState = 2; isMatchActive = false; isFrozen = false; isPaused = false
            halftimeBreakTime = if (halfDuration == 25) 10 * 60 else 15 * 60
            hasSecondHalfStarted = false
            awardedStoppageTime = 0 
            titret(800)
        } else if (matchState == 2) {
            matchState = 3; mainTime = halfDuration * 60; lostTime = 0; addedTime = 0
            isMatchActive = false; isFrozen = false; isPaused = false
            hasSecondHalfStarted = false
            awardedStoppageTime = 0 
            titret(500)
        } else if (matchState == 3) {
            titret(500)
        }
    }

    private fun handleReset() {
        matchState = 0; mainTime = 0; lostTime = 0; addedTime = 0
        isMatchActive = false; isPaused = false; isFrozen = false; activeMenuState = 0
        homeScore = 0; awayScore = 0; matchEvents.clear()
        isSubCountdownActive = false; isPenaltyActive = false; doubleYellowWarningPlayer = ""
        isScreenLocked = false; hasFirstHalfStarted = false; hasSecondHalfStarted = false
        awardedStoppageTime = 0
        titret(1000)
    }

    @Composable
    fun HakemSaatiTasarim() {
        val context = LocalContext.current
        var currentTime by remember { mutableStateOf("") }

        var drag9to3Active by remember { mutableStateOf(false) }
        var targetResetProgress by remember { mutableStateOf(0f) }
        val animatedResetProgress by animateFloatAsState(targetValue = targetResetProgress, animationSpec = tween(durationMillis = if (drag9to3Active) 0 else 300, easing = LinearEasing), label = "reset_anim")
        
        var drag3to9Active by remember { mutableStateOf(false) }
        var targetEndHalfProgress by remember { mutableStateOf(0f) }
        var drag3to9ActionType by remember { mutableStateOf(0) } 
        val animatedEndHalfProgress by animateFloatAsState(targetValue = targetEndHalfProgress, animationSpec = tween(durationMillis = if (drag3to9Active) 0 else 300, easing = LinearEasing), label = "end_half_anim")
        
        var dragLayer2Active by remember { mutableStateOf(false) }
        var dragLayer2Y by remember { mutableStateOf(0f) }

        var archiveMatches by remember { mutableStateOf(emptyList<SavedMatch>()) }
        var selectedArchiveMatch by remember { mutableStateOf<SavedMatch?>(null) }
        
        var isHoldingPause by remember { mutableStateOf(false) }

        val effectiveMainTime = mainTime - lostTime
        val limitForCalc = if (matchState == 1) halfDuration * 60 else (halfDuration * 2) * 60

        LaunchedEffect(Unit) {
            while (true) { currentTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date()); delay(1000) }
        }

        if (doubleYellowWarningPlayer.isNotEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().background(Color.Red).clickable { 
                    doubleYellowWarningPlayer = "" 
                    titret(50)
                }, 
                contentAlignment = Alignment.Center
            ) {
                Text(text = doubleYellowWarningPlayer, color = Color.White, fontSize = 120.sp, fontWeight = FontWeight.Bold)
            }
            return
        }

        if (matchState == 0) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("MAÇ KURULUMU", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                Box(modifier = Modifier.fillMaxWidth(0.85f).background(Color(0xFF333333), RoundedCornerShape(8.dp)).clickable { matchState = 11; titret(50) }.padding(10.dp), contentAlignment = Alignment.Center) {
                    Text(matchCategory, color = Color.Yellow, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
                Spacer(modifier = Modifier.height(8.dp))
                BasicTextField(value = homeTeamName, onValueChange = { homeTeamName = it }, textStyle = TextStyle(color = Color.White, textAlign = TextAlign.Center, fontWeight = FontWeight.Bold, fontSize = 14.sp), singleLine = true, cursorBrush = SolidColor(Color.White), modifier = Modifier.fillMaxWidth(0.85f).background(Color.DarkGray, RoundedCornerShape(8.dp)).padding(10.dp))
                Spacer(modifier = Modifier.height(8.dp))
                BasicTextField(value = awayTeamName, onValueChange = { awayTeamName = it }, textStyle = TextStyle(color = Color.Red, textAlign = TextAlign.Center, fontWeight = FontWeight.Bold, fontSize = 14.sp), singleLine = true, cursorBrush = SolidColor(Color.White), modifier = Modifier.fillMaxWidth(0.85f).background(Color.DarkGray, RoundedCornerShape(8.dp)).padding(10.dp))
                Spacer(modifier = Modifier.height(16.dp))
                Box(modifier = Modifier.fillMaxWidth(0.7f).background(Color(0xFF006400), RoundedCornerShape(20.dp)).clickable { matchState = 12; titret(100) }.padding(10.dp), contentAlignment = Alignment.Center) {
                    Text("SÜRE SEÇİMİ ->", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
                Spacer(modifier = Modifier.height(24.dp))
                Box(modifier = Modifier.fillMaxWidth(0.6f).height(1.dp).background(Color.DarkGray))
                Spacer(modifier = Modifier.height(16.dp))
                Box(modifier = Modifier.fillMaxWidth(0.8f).background(Color(0xFF004488), RoundedCornerShape(12.dp)).clickable { matchState = 8; titret(100) }.padding(10.dp), contentAlignment = Alignment.Center) {
                    Text("ARŞİV (Geçmiş Maçlar)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
            return
        }

        if (matchState == 11) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text(text = "KATEGORİ SEÇ", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                val cats = listOf("Süper Amatör", "1. Amatör", "2. Amatör", "BGL", "Gelişim Ligi", "Özel Maç")
                cats.forEach { cat ->
                    Box(modifier = Modifier.fillMaxWidth(0.8f).background(Color.DarkGray, RoundedCornerShape(12.dp)).clickable { matchCategory = cat; matchState = 0; titret(50) }.padding(10.dp), contentAlignment = Alignment.Center) { Text(cat, color = Color.White, fontWeight = FontWeight.Bold) }
                    Spacer(modifier = Modifier.height(8.dp))
                }
                Spacer(Modifier.height(12.dp))
                Box(modifier = Modifier.fillMaxWidth(0.6f).background(Color.Red.copy(alpha=0.5f), RoundedCornerShape(20.dp)).clickable { matchState = 0; titret(100) }.padding(8.dp), contentAlignment = Alignment.Center) { Text("GERİ", color = Color.White, fontSize = 12.sp) }
            }
            return
        }

        if (matchState == 12) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text(text = "MAÇ SÜRESİ", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                val butonlar = listOf(Pair(45, "90 DK (45+45)"), Pair(40, "80 DK (40+40)"), Pair(35, "70 DK (35+35)"), Pair(30, "60 DK (30+30)"), Pair(25, "50 DK (25+25)"))
                butonlar.forEach { (sure, metin) ->
                    Box(modifier = Modifier.fillMaxWidth(0.8f).background(Color.DarkGray, RoundedCornerShape(12.dp)).clickable { halfDuration = sure; halftimeBreakTime = if (sure == 25) 10 * 60 else 15 * 60; matchState = 1; titret(200) }.padding(10.dp), contentAlignment = Alignment.Center) { Text(metin, color = Color.White, fontWeight = FontWeight.Bold) }
                    Spacer(modifier = Modifier.height(8.dp))
                }
                Spacer(Modifier.height(12.dp))
                Box(modifier = Modifier.fillMaxWidth(0.6f).background(Color.Red.copy(alpha=0.5f), RoundedCornerShape(20.dp)).clickable { matchState = 0; titret(100) }.padding(8.dp), contentAlignment = Alignment.Center) { Text("GERİ DÖN", color = Color.White, fontSize = 12.sp) }
            }
            return
        }

        if (matchState == 8) {
            LaunchedEffect(Unit) { archiveMatches = loadMatchesFromArchive(context) }
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("GEÇMİŞ MAÇLAR", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(16.dp))
                if (archiveMatches.isEmpty()) { Text("Arşiv boş.", color = Color.Gray, fontSize = 14.sp) } 
                else {
                    archiveMatches.forEach { match ->
                        Box(modifier = Modifier.fillMaxWidth(0.9f).background(Color(0xFF333333), RoundedCornerShape(8.dp)).clickable { selectedArchiveMatch = match; matchState = 9; titret(50) }.padding(12.dp), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(match.category, color = Color.Yellow, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                Spacer(Modifier.height(2.dp))
                                Text(match.date, color = Color.LightGray, fontSize = 10.sp)
                                Spacer(Modifier.height(4.dp))
                                Text("${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}", color = Color.Cyan, fontSize = 13.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }
                }
                Spacer(Modifier.height(12.dp))
                Box(modifier = Modifier.fillMaxWidth(0.6f).background(Color.Red.copy(alpha=0.5f), RoundedCornerShape(20.dp)).clickable { matchState = 0; titret(100) }.padding(8.dp), contentAlignment = Alignment.Center) { Text("GERİ", color = Color.White, fontSize = 12.sp) }
            }
            return
        }

        if (matchState == 9 && selectedArchiveMatch != null) {
            val match = selectedArchiveMatch!!
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(top = 16.dp, bottom = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(match.category, color = Color.Yellow, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(match.date, color = Color.LightGray, fontSize = 10.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(match.homeTeam, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("${match.homeScore} - ${match.awayScore}", color = Color.Cyan, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                Text(match.awayTeam, color = Color(0xFFFF0000), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                
                Spacer(modifier = Modifier.height(16.dp))
                Box(modifier = Modifier.fillMaxWidth(0.8f).height(1.dp).background(Color.DarkGray))
                Spacer(modifier = Modifier.height(12.dp))
                
                val evEvents = match.events.filter { it.team == "EV SAHİBİ" }
                if (evEvents.isNotEmpty()) {
                    Text(match.homeTeam, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    evEvents.forEach { ev -> EventItemViewReadOnly(ev = ev, teamColor = Color.White) }
                    Spacer(Modifier.height(16.dp))
                }
                val depEvents = match.events.filter { it.team == "MİSAFİR" }
                if (depEvents.isNotEmpty()) {
                    Text(match.awayTeam, color = Color(0xFFFF0000), fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    depEvents.forEach { ev -> EventItemViewReadOnly(ev = ev, teamColor = Color(0xFFFF0000)) }
                }
                Spacer(Modifier.height(16.dp))
                Box(modifier = Modifier.fillMaxWidth(0.5f).background(Color.DarkGray, RoundedCornerShape(20.dp)).clickable { matchState = 8; titret(100) }.padding(6.dp), contentAlignment = Alignment.Center) { Text("GERİ DÖN", color = Color.White, fontSize = 12.sp) }
            }
            return
        }

        // İKİNCİ KATMAN: İNFO VE CEZALAR MENÜSÜ 
        if (activeMenuState == 8) {
            Column(modifier = Modifier.fillMaxSize().background(Color(0xFF222222)).verticalScroll(rememberScrollState()).padding(vertical = 16.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                
                Text("KONTROL MENÜSÜ", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(16.dp))
                
                Row(modifier = Modifier.fillMaxWidth(0.9f), horizontalArrangement = Arrangement.SpaceEvenly) {
                    Box(modifier = Modifier.weight(1f).height(45.dp).background(Color(0xFF333333), RoundedCornerShape(8.dp)).clickable { activeMenuState = 4; titret(100) }, contentAlignment = Alignment.Center) {
                        Text("EV İNFO", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    Spacer(Modifier.width(8.dp))
                    Box(modifier = Modifier.weight(1f).height(45.dp).background(Color(0xFF333333), RoundedCornerShape(8.dp)).clickable { activeMenuState = 5; titret(100) }, contentAlignment = Alignment.Center) {
                        Text("MSFR İNFO", color = Color.Red, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(modifier = Modifier.fillMaxWidth(0.9f), horizontalArrangement = Arrangement.SpaceEvenly) {
                    Box(modifier = Modifier.weight(1f).height(45.dp).background(Color(0xFFFFA500), RoundedCornerShape(8.dp)).clickable { 
                        if (!isSubCountdownActive) { isSubCountdownActive = true; subCountdownValue = 10; titret(100) }
                        activeMenuState = 0
                    }, contentAlignment = Alignment.Center) {
                        Text("10 SN CEZA", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    Spacer(Modifier.width(8.dp))
                    Box(modifier = Modifier.weight(1f).height(45.dp).background(Color.DarkGray, RoundedCornerShape(8.dp)).clickable { 
                        if (!isPenaltyActive || penaltyValue == 0) { isPenaltyActive = true; penaltyValue = 60; titret(100) } 
                        else { isPenaltyActive = false; titret(50) }
                        activeMenuState = 0
                    }, contentAlignment = Alignment.Center) {
                        Text(if (isPenaltyActive) "CEZA İPTAL" else "1 DK CEZA", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                Box(modifier = Modifier.fillMaxWidth(0.9f).height(45.dp).background(Color(0xFF006400), RoundedCornerShape(8.dp)).clickable { 
                    activeMenuState = 13; titret(100) 
                }, contentAlignment = Alignment.Center) {
                    Text("İLAVE SÜRE EKLE (+)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }

                Spacer(modifier = Modifier.height(24.dp))
                Box(modifier = Modifier.fillMaxWidth(0.6f).background(Color.Red.copy(alpha=0.5f), RoundedCornerShape(20.dp)).clickable { activeMenuState = 0; titret(100) }.padding(8.dp), contentAlignment = Alignment.Center) { 
                    Text("ANA EKRANA DÖN", color = Color.White, fontSize = 11.sp) 
                }
            }
            return
        }

        // İLAVE SÜRE SEÇİM EKRANI (Menü 13)
        if (activeMenuState == 13) {
            Column(modifier = Modifier.fillMaxSize().background(Color(0xFF222222)).verticalScroll(rememberScrollState()).padding(vertical = 16.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text("İLAVE SÜRE BELİRLE", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                
                val suggested = (lostTime + 45) / 60
                val suggestText = if (suggested > 0) "+$suggested DK" else "0 DK"
                Text("Kayıp Zaman: ${String.format("%02d:%02d", lostTime/60, lostTime%60)}", color = Color.Red, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("(Önerilen İlave: $suggestText)", color = Color.Gray, fontSize = 12.sp)
                
                Spacer(Modifier.height(16.dp))
                
                val numbers = (1..15).toList()
                val numRows = numbers.chunked(3)
                numRows.forEach { rowItems ->
                    Row(modifier = Modifier.fillMaxWidth(0.9f), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        rowItems.forEach { num -> 
                            Box(modifier = Modifier.weight(1f).height(45.dp).background(Color(0xFF004488), RoundedCornerShape(8.dp)).clickable { 
                                awardedStoppageTime = num
                                activeMenuState = 0
                                titret(200)
                            }, contentAlignment = Alignment.Center) { 
                                Text("+$num", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold) 
                            } 
                        }
                        for (i in 0 until (3 - rowItems.size)) { Spacer(modifier = Modifier.weight(1f)) } 
                    }
                    Spacer(Modifier.height(8.dp))
                }
                
                Spacer(Modifier.height(16.dp))
                Box(modifier = Modifier.fillMaxWidth(0.6f).background(Color.Red.copy(alpha=0.5f), RoundedCornerShape(20.dp)).clickable { activeMenuState = 8; titret(100) }.padding(8.dp), contentAlignment = Alignment.Center) { 
                    Text("İPTAL / GERİ", color = Color.White, fontSize = 12.sp) 
                }
            }
            return
        }

        if (activeMenuState == 6) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text("MAÇI BİTİR / SIFIRLA?", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(20.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    Box(modifier = Modifier.background(Color.DarkGray, RoundedCornerShape(12.dp)).clickable { activeMenuState = 0; titret(100) }.padding(horizontal = 20.dp, vertical = 14.dp), contentAlignment = Alignment.Center) { Text("HAYIR", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                    Box(modifier = Modifier.background(Color.Red, RoundedCornerShape(12.dp)).clickable { activeMenuState = 7; titret(200) }.padding(horizontal = 20.dp, vertical = 14.dp), contentAlignment = Alignment.Center) { Text("EVET", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                }
            }
            return
        }

        if (activeMenuState == 11) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                val baslik = if (matchState == 1) "İLK YARIYI BİTİR?" else "MAÇI BİTİR?"
                Text(baslik, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(20.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    Box(modifier = Modifier.background(Color.DarkGray, RoundedCornerShape(12.dp)).clickable { activeMenuState = 0; titret(100) }.padding(horizontal = 20.dp, vertical = 14.dp), contentAlignment = Alignment.Center) { Text("HAYIR", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                    Box(modifier = Modifier.background(Color(0xFF006400), RoundedCornerShape(12.dp)).clickable { handleNextState(); activeMenuState = 0; titret(200) }.padding(horizontal = 20.dp, vertical = 14.dp), contentAlignment = Alignment.Center) { Text("EVET", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                }
            }
            return
        }

        if (activeMenuState == 7) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text("EMİN MİSİNİZ?", color = Color.Red, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text("(Arşive kaydedilecek)", color = Color.Gray, fontSize = 12.sp)
                Spacer(Modifier.height(20.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    Box(modifier = Modifier.background(Color.DarkGray, RoundedCornerShape(12.dp)).clickable { activeMenuState = 0; titret(100) }.padding(horizontal = 16.dp, vertical = 14.dp), contentAlignment = Alignment.Center) { Text("İPTAL", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                    Box(modifier = Modifier.background(Color(0xFF8B0000), RoundedCornerShape(12.dp)).clickable { saveMatchToArchive(); handleReset(); titret(500) }.padding(horizontal = 16.dp, vertical = 14.dp), contentAlignment = Alignment.Center) { Text("BİTİR/KAYDET", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                }
            }
            return
        }

        if (activeMenuState == 1) {
            val teamColor = if (pendingTeam == "EV SAHİBİ") Color.White else Color(0xFFFF0000)
            val teamDispName = if (pendingTeam == "EV SAHİBİ") homeTeamName else awayTeamName
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(text = teamDispName, color = teamColor, fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                Spacer(modifier = Modifier.height(16.dp))
                val actions = listOf(Pair("GOL", Color.White), Pair("SARI KART", Color.Yellow), Pair("KIRMIZI KART", Color.Red))
                actions.forEach { (actionName, actionColor) ->
                    Box(modifier = Modifier.fillMaxWidth(0.85f).background(actionColor.copy(alpha = 0.2f), RoundedCornerShape(8.dp)).clickable { titret(50); pendingAction = actionName; pendingPlayerNo = ""; activeMenuState = 2 }.padding(vertical = 14.dp), contentAlignment = Alignment.Center) { Text(actionName, color = actionColor, fontWeight = FontWeight.Bold, fontSize = 15.sp) }
                    Spacer(modifier = Modifier.height(8.dp))
                }
                Spacer(modifier = Modifier.height(10.dp))
                Box(modifier = Modifier.fillMaxWidth(0.6f).background(Color.DarkGray, RoundedCornerShape(20.dp)).clickable { activeMenuState = 0; titret(100) }.padding(8.dp), contentAlignment = Alignment.Center) { Text("KAPAT", color = Color.White, fontSize = 12.sp) }
            }
            return
        }

        if (activeMenuState == 2) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                val headerColor = if (pendingAction == "GOL") Color.White else if (pendingAction == "SARI KART") Color.Yellow else Color.Red 
                Text(text = "$pendingAction İÇİN SEÇ:", color = headerColor, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                val onSelect = { selection: String ->
                    titret(30); pendingPlayerNo = selection
                    if(pendingAction == "GOL") { activeMenuState = 3 } 
                    else {
                        val minInt = (mainTime / 60) + 1
                        val minLabel = if (matchState == 1 && minInt > halfDuration) "$halfDuration+${minInt - halfDuration}" else if (matchState == 3 && minInt > halfDuration * 2) "${halfDuration * 2}+${minInt - halfDuration * 2}" else "$minInt"
                        if (pendingAction == "SARI KART") {
                            val existingYellows = matchEvents.count { it.team == pendingTeam && it.playerNo == selection && it.type == "SARI KART" }
                            matchEvents.add(MatchEvent(minLabel, pendingTeam, pendingAction, selection, ""))
                            if (existingYellows >= 1) { matchEvents.add(MatchEvent(minLabel, pendingTeam, "KIRMIZI KART", selection, "2. SARI")); doubleYellowWarningPlayer = selection; titret(1500) } else { titret(300) }
                        } else { matchEvents.add(MatchEvent(minLabel, pendingTeam, pendingAction, selection, "")); titret(300) }
                        activeMenuState = 0
                    }
                }
                Text("SAHA İÇİ OYUNCULAR", color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(6.dp))
                val numbers = (1..99).toList().map { it.toString() }
                val numRows = numbers.chunked(4)
                numRows.forEach { rowItems ->
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                        rowItems.forEach { num -> Box(modifier = Modifier.weight(1f).aspectRatio(1f).background(Color.DarkGray, RoundedCornerShape(8.dp)).clickable { onSelect(num) }, contentAlignment = Alignment.Center) { Text(text = num, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold) } }
                        for (i in 0 until (4 - rowItems.size)) { Spacer(modifier = Modifier.weight(1f)) } 
                    }
                    Spacer(Modifier.height(6.dp))
                }
                Spacer(Modifier.height(16.dp))
                Box(modifier = Modifier.fillMaxWidth(0.5f).background(Color.Red.copy(alpha=0.5f), RoundedCornerShape(20.dp)).clickable { activeMenuState = 1 }.padding(8.dp), contentAlignment = Alignment.Center) { Text("İPTAL", color = Color.White, fontSize = 12.sp) }
                Spacer(Modifier.height(30.dp)) 
            }
            return
        }

        if (activeMenuState == 3) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text("GOLÜN ŞEKLİ (#$pendingPlayerNo)", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(10.dp))
                val types = listOf("AYAK", "KAFA", "PENALTI", "KENDİ KALESİNE")
                types.forEach { t ->
                    Box(modifier = Modifier.fillMaxWidth(0.85f).background(Color(0xFF006400), RoundedCornerShape(8.dp)).clickable {
                        val minInt = (mainTime / 60) + 1
                        val minLabel = if (matchState == 1 && minInt > halfDuration) "$halfDuration+${minInt - halfDuration}" else if (matchState == 3 && minInt > halfDuration * 2) "${halfDuration * 2}+${minInt - halfDuration * 2}" else "$minInt"
                        if (t == "KENDİ KALESİNE") { if (pendingTeam == "EV SAHİBİ") awayScore++ else homeScore++ } 
                        else { if (pendingTeam == "EV SAHİBİ") homeScore++ else awayScore++ }
                        matchEvents.add(MatchEvent(minLabel, pendingTeam, pendingAction, pendingPlayerNo, t))
                        activeMenuState = 0; titret(300)
                    }.padding(12.dp), contentAlignment = Alignment.Center) { Text(t, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                    Spacer(Modifier.height(6.dp))
                }
            }
            return
        }

        if (activeMenuState == 4) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).padding(top = 16.dp, bottom = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(homeTeamName, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Column(modifier = Modifier.fillMaxWidth().weight(1f).verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
                    val evEvents = matchEvents.filter { it.team == "EV SAHİBİ" }
                    if (evEvents.isEmpty()) { Spacer(Modifier.height(20.dp)); Text("Kayıt Yok", color = Color.DarkGray, fontSize = 14.sp) } 
                    else { evEvents.forEach { ev -> EventItemViewReadOnly(ev = ev, teamColor = Color.White) } }
                }
                Spacer(Modifier.height(8.dp))
                Box(modifier = Modifier.fillMaxWidth(0.5f).background(Color.DarkGray, RoundedCornerShape(20.dp)).clickable { activeMenuState = 8; titret(100) }.padding(6.dp), contentAlignment = Alignment.Center) { Text("GERİ", color = Color.White, fontSize = 12.sp) }
            }
            return
        }

        if (activeMenuState == 5) {
            Column(modifier = Modifier.fillMaxSize().background(Color.Black).padding(top = 16.dp, bottom = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(awayTeamName, color = Color(0xFFFF0000), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Column(modifier = Modifier.fillMaxWidth().weight(1f).verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
                    val depEvents = matchEvents.filter { it.team == "MİSAFİR" }
                    if (depEvents.isEmpty()) { Spacer(Modifier.height(20.dp)); Text("Kayıt Yok", color = Color.DarkGray, fontSize = 14.sp) } 
                    else { depEvents.forEach { ev -> EventItemViewReadOnly(ev = ev, teamColor = Color(0xFFFF0000)) } }
                }
                Spacer(Modifier.height(8.dp))
                Box(modifier = Modifier.fillMaxWidth(0.5f).background(Color.DarkGray, RoundedCornerShape(20.dp)).clickable { activeMenuState = 8; titret(100) }.padding(6.dp), contentAlignment = Alignment.Center) { Text("GERİ", color = Color.White, fontSize = 12.sp) }
            }
            return
        }

        Box(
            modifier = Modifier.fillMaxSize().background(Color.Black)
            .pointerInput(Unit) {
                // İKİ PARMAK KİLİDİ 
                awaitPointerEventScope {
                    while (true) {
                        val event = awaitPointerEvent(androidx.compose.ui.input.pointer.PointerEventPass.Initial)
                        val pressedPointers = event.changes.filter { it.pressed }
                        if (pressedPointers.size == 2) {
                            val now = System.currentTimeMillis()
                            if (now - lastLockToggleTime > 500) {
                                isScreenLocked = !isScreenLocked
                                lastLockToggleTime = now
                                titret(80) 
                            }
                            pressedPointers.forEach { it.consume() }
                        }
                    }
                }
            }
            .pointerInput(Unit) {
                // DOKUNMATİK MOTORU (Hatasız ve Kurşun Geçirmez)
                detectTapGestures(
                    onDoubleTap = { offset ->
                        if (isScreenLocked) return@detectTapGestures
                        val w = size.width; val h = size.height
                        
                        // İLAVE ZAMAN GÖSTERİMİ İÇİN GÜNEYE ÇİFT TIK
                        val limitForCalc = if (matchState == 1) halfDuration * 60 else (halfDuration * 2) * 60
                        if (mainTime >= limitForCalc && !isFrozen) {
                            if (offset.y > h * 0.5f && offset.y < h * 0.85f && offset.x > w * 0.35f && offset.x < w * 0.65f) { 
                                if (!showStoppageTimer) { showStoppageTimer = true; stoppageTimeRemaining = lostTime; titret(80) } 
                                return@detectTapGestures
                            }
                        }
                        
                        // ÇİFT TIKLAMA İLE MORS ALFABESİ (Tık-Tık!)
                        if (activeMenuState == 0 && (matchState == 1 || matchState == 3) && !isFrozen && !isSubCountdownActive) {
                            val isCenter = offset.x > w * 0.35f && offset.x < w * 0.65f && offset.y > h * 0.35f && offset.y < h * 0.65f
                            val isBottomClock = offset.y > h * 0.85f

                            if (!isCenter && !isBottomClock) {
                                if (offset.y <= h * 0.5f) { // KUZEY
                                    if (offset.x < w / 2) { mainTime += 1 }       // Sol Üst
                                    else { mainTime += 60 }                       // Sağ Üst
                                } else { // GÜNEY
                                    if (offset.x < w / 2) { if (mainTime >= 1) mainTime -= 1 } // Sol Alt
                                    else { if (mainTime >= 60) mainTime -= 60 else mainTime = 0 } // Sağ Alt
                                }
                                titret(30)
                            }
                        }
                    },
                    onPress = { offset ->
                        if (isScreenLocked) return@detectTapGestures
                        val w = size.width; val h = size.height
                        val isLostTimeArea = offset.x < w / 2 && offset.y > h * 0.5f && offset.y < h * 0.85f
                        val isPeriodStarted = if (matchState == 1) hasFirstHalfStarted else if (matchState == 3) hasSecondHalfStarted else false
                        
                        // KAYIP ZAMANA BASILI TUTARAK OYUNU DURDUR/BAŞLAT
                        if (activeMenuState == 0 && (matchState == 1 || matchState == 3) && !isFrozen && !isSubCountdownActive && isLostTimeArea && isPeriodStarted) {
                            val holdJob = matchScope.launch {
                                delay(250) 
                                isHoldingPause = true
                                titret(800) 
                            }
                            val success = tryAwaitRelease()
                            holdJob.cancel()
                            
                            if (isHoldingPause) {
                                isHoldingPause = false
                                if (success) {
                                    togglePause() 
                                }
                            }
                        }
                    },
                    onLongPress = { offset ->
                        if (isScreenLocked) return@detectTapGestures
                        val w = size.width; val h = size.height
                        if (activeMenuState == 0 && (matchState == 1 || matchState == 3) && !isFrozen && !isSubCountdownActive) {
                            if (offset.y <= h * 0.5f) { 
                                if (offset.x <= w / 2) { pendingTeam = "EV SAHİBİ"; activeMenuState = 1; titret(200) } 
                                else { pendingTeam = "MİSAFİR"; activeMenuState = 1; titret(200) }
                            }
                        }
                    }
                )
            }.pointerInput(Unit) {
                var dragOffsetX = 0f; var dragOffsetY = 0f
                detectDragGestures(
                    onDragStart = { offset -> 
                        if (isScreenLocked) return@detectDragGestures
                        val w = size.width; val h = size.height
                        if (activeMenuState == 0 && matchState != 0 && matchState != 12 && !isSubCountdownActive) { 
                            val limit = halfDuration * 60
                            // 9'dan 3'e Çekiş - Arşivleme
                            if (offset.x < w * 0.25f && offset.y > h * 0.3f && offset.y < h * 0.7f) { 
                                drag9to3Active = true; targetResetProgress = 0f; titret(30) 
                            }
                            // 3'ten 9'a Çekiş - Anayasa Kuralları
                            else if (offset.x > w * 0.75f && offset.y > h * 0.3f && offset.y < h * 0.7f) {
                                if (matchState == 1 && !hasFirstHalfStarted) { drag3to9ActionType = 1; drag3to9Active = true; targetEndHalfProgress = 0f; titret(30) } 
                                else if (matchState == 1 && mainTime >= limit) { drag3to9ActionType = 2; drag3to9Active = true; targetEndHalfProgress = 0f; titret(30) } 
                                else if (matchState == 3 && !hasSecondHalfStarted) { drag3to9ActionType = 3; drag3to9Active = true; targetEndHalfProgress = 0f; titret(30) } 
                                else if (matchState == 3 && mainTime >= limit * 2) { drag3to9ActionType = 4; drag3to9Active = true; targetEndHalfProgress = 0f; titret(30) } 
                                else if (matchState == 2) { drag3to9ActionType = 5; drag3to9Active = true; targetEndHalfProgress = 0f; titret(30) } 
                                else { titret(50) }
                            }
                            // KİTAP YAPRAĞI (6'dan Ortaya Çekiş -> 2. Katmana Geçiş)
                            else if (offset.y > h * 0.75f && offset.x > w * 0.25f && offset.x < w * 0.75f) {
                                dragLayer2Active = true; dragLayer2Y = offset.y; titret(30)
                            }
                        }
                    },
                    onDrag = { change, dragAmount -> 
                        if (isScreenLocked) return@detectDragGestures
                        if (drag9to3Active) {
                            change.consume(); val w = size.width
                            var progress = (change.position.x / w) * 360f
                            if (progress < 0f) progress = 0f; if (progress > 360f) progress = 360f
                            targetResetProgress = progress
                        } else if (drag3to9Active) {
                            change.consume(); val w = size.width
                            var progress = ((w - change.position.x) / w) * 360f
                            if (progress < 0f) progress = 0f; if (progress > 360f) progress = 360f
                            targetEndHalfProgress = progress
                        } else if (dragLayer2Active) {
                            change.consume()
                            dragLayer2Y += dragAmount.y
                            if (dragLayer2Y < size.height / 2f) {
                                dragLayer2Active = false
                                activeMenuState = 8
                                titret(100)
                            }
                        } else { dragOffsetX += dragAmount.x; dragOffsetY += dragAmount.y }
                    },
                    onDragEnd = {
                        if (drag9to3Active) {
                            drag9to3Active = false 
                            if (targetResetProgress > 320f) { targetResetProgress = 0f; activeMenuState = 6; titret(300) } else { targetResetProgress = 0f }
                        }
                        if (drag3to9Active) {
                            drag3to9Active = false 
                            if (targetEndHalfProgress > 320f) { 
                                targetEndHalfProgress = 0f
                                when (drag3to9ActionType) {
                                    1 -> { hasFirstHalfStarted = true; togglePause(); titret(500) }
                                    2 -> { activeMenuState = 11; titret(300) }
                                    3 -> { hasSecondHalfStarted = true; togglePause(); titret(500) }
                                    4 -> { activeMenuState = 11; titret(300) }
                                    5 -> { handleNextState(); titret(300) }
                                }
                            } else { targetEndHalfProgress = 0f }
                        }
                        dragLayer2Active = false
                    },
                    onDragCancel = { drag9to3Active = false; targetResetProgress = 0f; drag3to9Active = false; targetEndHalfProgress = 0f; dragLayer2Active = false }
                )
            }, contentAlignment = Alignment.Center
        ) {
            val infiniteTransition = rememberInfiniteTransition()

            if (matchState == 2) {
                val rotationAnimation by infiniteTransition.animateFloat(initialValue = 0f, targetValue = 360f, animationSpec = infiniteRepeatable(animation = tween(6000, easing = LinearEasing), repeatMode = RepeatMode.Restart))
                val pulseAlpha by infiniteTransition.animateFloat(initialValue = 0.3f, targetValue = 1f, animationSpec = infiniteRepeatable(animation = tween(1200, easing = FastOutSlowInEasing), repeatMode = RepeatMode.Reverse))

                Canvas(modifier = Modifier.fillMaxSize().padding(4.dp)) {
                    val center = Offset(size.width / 2, size.height / 2)
                    drawArc(Color.DarkGray.copy(alpha = 0.4f), 0f, 360f, false, style = Stroke(width = 2.dp.toPx()))
                    rotate(rotationAnimation, center) { drawArc(Color(0xFF00FF00).copy(alpha = 0.3f), 0f, 360f, false, style = Stroke(width = 4.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 20f), 0f))) }
                    val maxHalftime = if (halfDuration == 25) 10 * 60f else 15 * 60f
                    val sweepAngle = (halftimeBreakTime / maxHalftime) * 360f
                    if (sweepAngle > 0f) drawArc(Color.Red, -90f, sweepAngle, false, style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round))
                }

                Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(vertical = 30.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = currentTime, color = Color.LightGray, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "DEVRE ARASI", color = Color.Red.copy(alpha = pulseAlpha), fontSize = 16.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    
                    val hMin = halftimeBreakTime / 60; val hSec = halftimeBreakTime % 60
                    Text(text = String.format("%02d:%02d", hMin, hSec), color = Color.White, fontSize = 48.sp, fontWeight = FontWeight.Bold)
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("2. YARIYA GEÇMEK İÇİN SAĞDAN", color = Color.Gray, fontSize = 10.sp)
                    Text("SOLA ÇEK (3'TEN 9'A)", color = Color.Gray, fontSize = 10.sp)
                }
            } else {
                Canvas(modifier = Modifier.fillMaxSize().padding(2.dp)) {
                    val radius = size.minDimension / 2; val center = Offset(size.width / 2, size.height / 2)
                    for (i in 0..11) {
                        val angle = (i * 30f) - 90f; val rad = Math.toRadians(angle.toDouble())
                        drawCircle(color = Color.DarkGray, radius = 1.5.dp.toPx(), center = Offset(center.x + radius * cos(rad).toFloat(), center.y + radius * sin(rad).toFloat()))
                    }
                    val maxSweep = halfDuration * 6f
                    val currentSecondsInHalf = if (matchState == 1) effectiveMainTime else (effectiveMainTime - halfDuration * 60)
                    val sweepAngle = (currentSecondsInHalf / 60f * 6f).coerceAtMost(maxSweep)
                    val cyanSweep = 360f - maxSweep

                    if (cyanSweep > 0f) drawArc(Color.Cyan, -90f + maxSweep, cyanSweep, false, style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round))
                    if (sweepAngle < maxSweep) drawArc(Color.Red, -90f + sweepAngle, maxSweep - sweepAngle, false, style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round))
                    if (sweepAngle > 0f) drawArc(Color(0xFF00FF00), -90f, sweepAngle, false, style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round))
                }

                // KUSURSUZ EKRAN DİZİLİMİ (ŞAPKA/ÇATI DÜZENİ)
                Column(modifier = Modifier.fillMaxSize()) {
                    
                    // KUZEY YARIM KÜRE
                    Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.BottomCenter) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(bottom = 6.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                val neonAmber = Color(0xFFFFB300)
                                Text(text = "$homeScore", color = neonAmber, fontSize = 26.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(4.dp)) 
                                Text(text = "-", color = neonAmber, fontSize = 26.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(4.dp)) 
                                Text(text = "$awayScore", color = neonAmber, fontSize = 26.sp, fontWeight = FontWeight.Bold)
                            }
                            
                            Spacer(modifier = Modifier.height(2.dp))
                            
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                                val homeReds = matchEvents.count { it.team == "EV SAHİBİ" && it.type == "KIRMIZI KART" && it.playerNo.toIntOrNull() != null }
                                if (homeReds > 0) {
                                    Box(modifier = Modifier.padding(end = 6.dp, bottom = 4.dp).size(width = 16.dp, height = 22.dp).background(Color.Red, RoundedCornerShape(2.dp)), contentAlignment = Alignment.Center) {
                                        Text(text = "$homeReds", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                    }
                                } else { Spacer(modifier = Modifier.padding(end = 6.dp, bottom = 4.dp).size(width = 16.dp, height = 22.dp)) }
                                
                                Text(text = String.format("%02d:%02d", mainTime / 60, mainTime % 60), fontSize = 50.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                
                                val awayReds = matchEvents.count { it.team == "MİSAFİR" && it.type == "KIRMIZI KART" && it.playerNo.toIntOrNull() != null }
                                if (awayReds > 0) {
                                    Box(modifier = Modifier.padding(start = 6.dp, bottom = 4.dp).size(width = 16.dp, height = 22.dp).background(Color.Red, RoundedCornerShape(2.dp)), contentAlignment = Alignment.Center) {
                                        Text(text = "$awayReds", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                    }
                                } else { Spacer(modifier = Modifier.padding(start = 6.dp, bottom = 4.dp).size(width = 16.dp, height = 22.dp)) }
                            }
                        }
                    }

                    // GÜNEY YARIM KÜRE (Çatı Sistemi - TopCenter Hizalama)
                    Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.TopCenter) {
                        Row(modifier = Modifier.fillMaxWidth(0.9f).padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceEvenly, verticalAlignment = Alignment.Top) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("KAYIP ZAMAN", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                Text(text = String.format("%02d:%02d", lostTime / 60, lostTime % 60), color = Color.Red, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                val limitForCalc = if (matchState == 1) halfDuration * 60 else (halfDuration * 2) * 60
                                if (effectiveMainTime < limitForCalc) {
                                    val rem = limitForCalc - effectiveMainTime
                                    Text("KALAN SÜRE", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    Text(text = String.format("%02d:%02d", rem / 60, rem % 60), color = Color(0xFF00FF00), fontSize = 28.sp, fontWeight = FontWeight.Bold)
                                } else {
                                    if (awardedStoppageTime > 0) {
                                        val over = effectiveMainTime - limitForCalc
                                        val remainingExtra = (awardedStoppageTime * 60) - over
                                        if (remainingExtra >= 0) {
                                            Text("UZATMA (KALAN)", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                            Text(text = String.format("%02d:%02d", remainingExtra / 60, remainingExtra % 60), color = Color(0xFFFFB300), fontSize = 28.sp, fontWeight = FontWeight.Bold)
                                        } else {
                                            val exceeded = -remainingExtra
                                            Text("SÜRE DOLDU (+)", color = Color.Red, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                            Text(text = "+${String.format("%02d:%02d", exceeded / 60, exceeded % 60)}", color = Color.Red, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                                        }
                                    } else {
                                        val over = effectiveMainTime - limitForCalc
                                        Text("İLAVE OYNANAN", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                        Text(text = "+${String.format("%02d:%02d", over / 60, over % 60)}", color = Color(0xFF00FF00), fontSize = 28.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
                
                // GERÇEK SAAT VE (+) İKONU BİRLEŞİMİ
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomCenter) { 
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(bottom = 12.dp)) {
                        Box(modifier = Modifier.background(Color(0xFF333333), RoundedCornerShape(4.dp)).padding(horizontal = 8.dp, vertical = 2.dp)) {
                            val badgeText = if (awardedStoppageTime > 0) "+$awardedStoppageTime DK" else "+"
                            Text(text = badgeText, color = Color(0xFFFFB300), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (isScreenLocked) { Text(text = "🔒 ", color = Color.Red, fontSize = 16.sp) }
                            Text(text = currentTime, color = Color.LightGray, fontSize = 18.sp, fontWeight = FontWeight.Bold) 
                        }
                    }
                }
            }

            // --- KİTAP YAPRAĞI ANİMASYONU ---
            if (dragLayer2Active) {
                Box(modifier = Modifier.fillMaxSize().offset { IntOffset(0, dragLayer2Y.toInt()) }.background(Color(0xFF111111), RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp))) {
                    Box(modifier = Modifier.fillMaxWidth().padding(top = 12.dp), contentAlignment = Alignment.TopCenter) {
                        Box(modifier = Modifier.width(40.dp).height(4.dp).background(Color.Gray, RoundedCornerShape(2.dp)))
                    }
                }
            }

            // --- ANİMASYONLAR VE POPUPLAR ---
            if (drag9to3Active || animatedResetProgress > 0f) {
                Canvas(modifier = Modifier.fillMaxSize().padding(6.dp)) { drawArc(color = Color.Red, startAngle = 180f, sweepAngle = animatedResetProgress, useCenter = false, style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)) }
            }
            
            if (drag3to9Active || animatedEndHalfProgress > 0f) {
                Box(modifier = Modifier.fillMaxSize().background(Color(0xCC006400)), contentAlignment = Alignment.Center) {
                    val textAction = when (drag3to9ActionType) { 1 -> "MAÇ BAŞLIYOR..."; 2 -> "İLK YARI BİTİYOR..."; 3 -> "2. YARI BAŞLIYOR..."; 4 -> "MAÇ BİTİYOR..."; 5 -> "DEVREYİ GEÇ..."; else -> "" }
                    Text(text = textAction, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }
                Canvas(modifier = Modifier.fillMaxSize().padding(6.dp)) { drawArc(color = Color.Green, startAngle = 0f, sweepAngle = -animatedEndHalfProgress, useCenter = false, style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)) }
            }

            if (isHoldingPause) {
                val isResuming = isPaused
                val bgColor = if (isResuming) Color(0xCC00AA00) else Color(0xCCFF0000)
                val actionText = if (isResuming) "OYUN BAŞLATILIYOR..." else "OYUN DURDURULUYOR..."
                Box(modifier = Modifier.fillMaxSize().background(bgColor), contentAlignment = Alignment.Center) {
                    Text(text = actionText, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                }
            }
        }
    }
}
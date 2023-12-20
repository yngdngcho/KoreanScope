PennController.ResetPrefix(null); // Shorten command names (keep this line here))

DebugOff()   // Debugger is closed

// Sequence of events: consent to ethics statement required to start the experiment, participant information, instructions, exercise, transition screen, main experiment, result logging, and end screen.
Sequence("consent", "setcounter", "participants", "instructions", "instructions1", "instructions2", randomize("exercise"), "start_experiment", rshuffle("experiment", "filler"), SendResults(), "end")

// Ethics agreement: participants must agree before continuing
newTrial("consent",
    newHtml("consent_form", "consent.html")
        .cssContainer({"width":"720px"})
        .checkboxWarning("동의 후 실험에 참가할 수 있습니다.")
        .center()
        .print()
    ,
    newButton("continue", "다음 페이지로 넘어갑니다")
        .center()
        .print()
        .wait(getHtml("consent_form").test.complete()
                  .failure(getHtml("consent_form").warn())
        )   
)

// Start the next list as soon as the participant agrees to the ethics statement
// This is different from PCIbex's normal behavior, which is to move to the next list once 
// the experiment is completed. In my experiment, multiple participants are likely to start 
// the experiment at the same time, leading to a disproportionate assignment of participants
// to lists.
SetCounter("setcounter")

// Participant information: questions appear as soon as information is input
newTrial("participants",
    defaultText
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .center()
        .print()
    ,
    newText("participant_info_header", "<div class='fancy'><p>반갑습니다! 실험에 참여해주셔서 감사합니다.<br>본 실험에서는 다양한 한국어 문장을 읽게 되실 것입니다.<br>실험에 참여할 준비가 되셨나요? 아래 안내를 따라 정보를 입력해주세요.</p></div>")
    ,
    //generate unique user id
    // uniqueID = [1,2,3,4].map(v=>Math.floor((1+Math.random())*0x10000).toString(16).substring(1)).join('-')

    // Participant ID (6-place)
    newText("participantID", "<b>ID</b>를 입력해주세요. ID는 본인 이름의 이니셜과 성의 조합으로 써주시면 됩니다.<br>(예: 홍길동 -> gdhong)<br>입력 후 엔터를 눌러주세요.")
    ,
    newTextInput("input_ID")
        .log()
        .center()
        .print()
        .wait()
    ,
    // Korean native speaker question
    newText("<b>모국어가 <b>한국어</b>인가요?</b>")
    ,
    newScale("input_korean", "네", "아니오")
        .radio()
        .log()
        .labelsPosition("right")
        .center()
        .print()
        .wait()
    ,
    // Age
    newText("<b>나이</b> (나이는 숫자로만 입력해주세요.)<br>입력 후 엔터를 눌러주세요.")
    ,
    newTextInput("input_age")
        .length(2)
        .log()
        .center()
        .print()
        .wait()
    ,
    // Clear error messages if the participant changes the input
    //newKey("just for callback", "") 
    //    .callback( getText("errorage").remove() , getText("errorID").remove() )
    //,
    // Formatting text for error messages
    defaultText.color("Crimson").print()
    ,
    // Continue. Only validate a click when ID and age information is input properly
    newButton("weiter", "다음 페이지로 이동합니다")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .center()
        .print()
        // Check for participant ID and age input
        .wait(
             newFunction('dummy', ()=>true).test.is(true)
            // ID
            .and( getTextInput("input_ID").testNot.text("")
                .failure( newText('errorID',  "본인의 ID를 입력해주세요.") )
            // Age
            ).and( getTextInput("input_age").test.text(/^\d+$/)
                .failure( newText('errorage', "본인의 나이를 입력해주세요."), 
                          getTextInput("input_age").text("")))  
        )
    ,
    // Store the texts from inputs into the Var elements
    getVar("ID")     .set( getTextInput("input_ID") ),
    getVar("KOREAN") .set( getScale("input_korean") ),
    getVar("AGE")    .set( getTextInput("input_age") )
)

Header(
    // Declare global variables to store the participant's ID and demographic information
    newVar("ID").global(),
    newVar("KOREAN").global(),
    newVar("AGE").global()
)

 // Add the particimant info to all trials' results lines
.log( "id"     , getVar("ID") )
.log( "korean" , getVar("KOREAN") )
.log( "age"    , getVar("AGE") )

// Instructions
newTrial("instructions",
    newText("participant_info_header", "<h2>실험방식</h2><p>본 실험은 언어 사용자들이 실제로 어떻게 문장을 이해하고 있는지를 연구합니다.<br>실험이 시작되면 여러 개의 한국어 문장을 읽게 됩니다.<br>각 문장을 <b>1 '매우 부자연스러움'</b> 에서 <b>7 '매우 자연스러움'</b>까지 7단계로 평가해 주세요.<br>문장이 a)문법적으로 옳고 b)의미가 자연스럽다면 <b>7‘매우 자연스러움’</b>을 선택하십시오.<br>사용될 척도는 다음과 같이 나타납니다:</p>")
        .left()
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        ,
    // 7-point scale
    newScale("acceptability", "1","2","3","4","5","6","7")
        .before( newText("left", "<div class='fancy'>(매우 부자연스러움)</div>") )
        .after( newText("right", "<div class='fancy'>(매우 자연스러움)</div>") )
        .labelsPosition("top")
        //.callback(getText("warning").hidden() )
        .center()
        .log()
        .print()
        ,
    newText("문장에 대한 자연스러운 정도를 마우스로 클릭하여 평가할 수 있습니다.<br>문장 평가 완료 후 다음 문장으로 넘어가면, 이전의 문장에 대한 평가를 변경할 수 없습니다.")
        .left()
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        ,
    newButton("go_to_next_page", "다음 페이지로 넘어갑니다")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
)

newTrial("instructions1",
    newText("instructions_text1", "<p>본 실험에서는 다음과 같은 연이은 두 개의 문장을 보게 됩니다.</p> <p><span style='color: blue;'><b>'어제 재민이가 햄버거를 먹었다. 그 햄버거는 불고기 버거였다.'</b></span></p><p>그리고, 다음과 같은 질문에 응답을 하게 됩니다.</p><p><span style='color: blue;'><b>'질문: 첫번째 문장에 이어지는 문장으로 두번째 문장은 얼마나 자연스럽습니까?'</b></span></p><p>두번째 문장 '그 햄버거는 불고기 버거였다.'는 의미적으로 첫번째 문장에 대한 부연설명으로 볼 수 있습니다.<br>따라서 두번째 문장은 첫번째 문장에 이어지는 문장으로서 적합합니다.<br>즉, 두번째 문장에 대한 응답으로 상대적으로 높은 척도 (예: <b>７ '매우 자연스러움'</b>)를 선택하실 수 있습니다.</p>")
    .left()
    .cssContainer({"margin":"1em"})
    .center()
    .print()
    ,
    
    //newHtml("instructions_text1", "instructions1.html")
    //    .cssContainer({"margin":"1em"})
    //    .center()
    //    .print()
    //    ,
    newButton("go_to_exercise", "다음 페이지로 넘어갑니다")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
)

newTrial("instructions2",
    newText("instructions_text2", "<p>또한, 다음과 같은 문장을 보게될 수도 있습니다:</p><p><span style='color: blue;'><b>'동물원에서 호랑이가 탈출했다. 그 여우는 마을을 돌아다녔다.'</b></span></p><p>마찬가지로 두번째 문장에 대한 자연스러움을 평가하게 됩니다.</p><p><span style='color: blue;'><b>'질문: 첫번째 문장에 이어지는 문장으로 두번째 문장은 얼마나 자연스럽습니까?'</b></span></p><br> 두번째 문장에서 '그 여우'는 첫번째 문장과 연관되어 있지 않습니다. 이전 문장에서 여우가 언급된 적이 없기 때문입니다. <br>따라서, 두번째 문장은 첫번째 문장에 이어지는 문장으로서 자연스럽지 않습니다.<br>이 경우, 두번째 문장에 대해 상대적으로 낮은 자연스러움 척도 (예: <b>1 '매우 부자연스러움'</b>)를 선택하실 수 있습니다.</p><p>본격적인 실험에 앞서, 3번의 연습 문장을 보게됩니다. 연습 문장에 대한 평가를 마친 후 실제 실험이 이어집니다. <br>실험은 대략 20분 정도 소요될 예정입니다.</p>")
    .left()
    .cssContainer({"margin":"1em"})
    .center()
    .print()
    ,
    
    //newHtml("instructions_text2", "instructions2.html")
    //    .cssContainer({"margin":"1em"})
    //    .center()
    //    .print()
    //    ,
    newButton("go_to_next_page", "연습을 시작합니다")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
)


// Exercise

newTrial( "exercise" ,
    newText("질문: 첫번째 문장에 이어지는 문장으로 두번째 문장은 얼마나 자연스럽습니까?")
        .color("Blue")            
        .center()
        .print()
        ,
    newText("sentence", "이른 아침에 철수가 강아지를 산책시켰다. 그 강아지는 용변을 밖에서만 보기 때문이다.")
        .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
        .center()
        .print()
        ,
    newScale("acceptability", "1","2","3","4","5","6","7")
        .before( newText("left", "<div class='fancy'>(매우 부자연스러움)</div>") )
        .after( newText("right", "<div class='fancy'>(매우 자연스러움)</div>") )
        .labelsPosition("top")
        //.callback(getText("warning").hidden() )
        .center()
        .log()
        .print()
        .wait()
        ,
        newText("feedback", "두번째 문장은 첫번째 문장에 대한 부연설명으로서, 이어지는 문장으로서 자연스럽습니다.<br>이 경우, 두번째 문장에 대해 상대적으로 높은 자연스러움 척도 (예: <b>5, 6, 7</b>)를 선택하실 수 있습니다.")
        .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
        .center()
        .color("Red")
        .print()
        ,
        // Wait briefly to display which option was selected
        newTimer("wait", 300)
        .start()
        .wait()
        ,
        
    newText("warning", "문장에 대한 평가를 해주십시오.").center().color("red").hidden().print()
    ,
        
    newButton("continue", "다음으로 넘어갑니다")
        .print()
        .center()
        .wait( getScale("acceptability").test.selected().failure(getText("warning").visible()) )
        .log()
)

newTrial( "exercise" ,
    newText("질문: 첫번째 문장에 이어지는 문장으로 두번째 문장은 얼마나 자연스럽습니까?")
        .color("Blue")            
        .center()
        .print()
        ,
    newText("sentence", "캠퍼스에서 까마귀가 시끄럽게 울었다. 그 참새는 하루종일 울어댔다.")
        .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
        .center()
        .print()
        ,
    newScale("acceptability", "1","2","3","4","5","6","7")
        .before( newText("left", "<div class='fancy'>(매우 부자연스러움)</div>") )
        .after( newText("right", "<div class='fancy'>(매우 자연스러움)</div>") )
        .labelsPosition("top")
        //.callback(getText("warning").hidden() )
        .center()
        .log()
        .print()
        .wait()
        ,
        newText("feedback", "두번째 문장의 '그 참새'는 첫번째 문장과 연관되어 있지 않습니다. 즉, 이어지는 문장으로서 부자연스럽습니다.<br>이 경우, 두번째 문장에 대해 상대적으로 낮은 자연스러움 척도 (예: <b>1, 2, 3</b>)를 선택하실 수 있습니다.")
        .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
        .center()
        .color("Red")
        .print()
        ,
        // Wait briefly to display which option was selected
        newTimer("wait", 300)
        .start()
        .wait()
        ,
        
    newText("warning", "문장에 대한 평가를 해주십시오.").center().color("red").hidden().print()
    ,
        
    newButton("continue", "다음으로 넘어갑니다")
        .print()
        .center()
        .wait( getScale("acceptability").test.selected().failure(getText("warning").visible()) )
        .log()
)

newTrial( "exercise" ,
    newText("질문: 첫번째 문장에 이어지는 문장으로 두번째 문장은 얼마나 자연스럽습니까?")
        .color("Blue")            
        .center()
        .print()
        ,
    newText("sentence", "무덤에서 도굴꾼이 금괴를 발견했다. 그 금괴는 그들이 번 돈으로 구매한 것이다.")
        .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
        .center()
        .print()
        ,
    newScale("acceptability", "1","2","3","4","5","6","7")
        .before( newText("left", "<div class='fancy'>(매우 부자연스러움)</div>") )
        .after( newText("right", "<div class='fancy'>(매우 자연스러움)</div>") )
        .labelsPosition("top")
        //.callback(getText("warning").hidden() )
        .center()
        .log()
        .print()
        .wait()
        ,
        newText("feedback", "두번째 문장은 첫번째 문장의 내용과 일관되지 않습니다. 즉, 이어지는 문장으로서 자연스럽지 않습니다.<br>이 경우, 두번째 문장에 대해 상대적으로 낮은 자연스러움 척도 (예: <b>1, 2, 3</b>)를 선택하실 수 있습니다.")
        .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
        .center()
        .color("Red")
        .print()
        ,
        // Wait briefly to display which option was selected
        newTimer("wait", 300)
        .start()
        .wait()
        ,
        
    newText("warning", "문장에 대한 평가를 해주십시오.").center().color("red").hidden().print()
    ,
        
    newButton("continue", "다음으로 넘어갑니다")
        .print()
        .center()
        .wait( getScale("acceptability").test.selected().failure(getText("warning").visible()) )
        .log()
)

// Start experiment
newTrial( "start_experiment" ,
    newText("<h2>연습이 종료되었습니다. 실제 실험을 시작합니다.</h2>")
        .center()
        .print()
    ,
    newButton("go_to_experiment", "실험을 시작합니다")
        .print()
        .center()
        .wait()
)

// Experiment
Template("stimuli.csv", row =>
    newTrial( "experiment" ,
        newText("질문: 첫번째 문장에 이어지는 문장으로 두번째 문장은 얼마나 자연스럽습니까?")
            .color("Blue")
            .center()
            .print()
            ,
        newText("sentence", row.Sentence)
            .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
            .center()
            .print()
            ,
    // 7-point scale
        newScale("acceptability", "1","2","3","4","5","6","7")
            .before( newText("left", "<div class='fancy'>(매우 부자연스러움)</div>") )
            .after( newText("right", "<div class='fancy'>(매우 자연스러움)</div>") )
            .labelsPosition("top")
            //.callback(getText("warning").hidden() )
            .center()
            .log()
            .print()
            ,
        // Wait briefly to display which option was selected
            newTimer("wait", 300)
            .start()
            .wait()
        ,
        
        newText("warning", "문장에 대한 평가를 해주십시오.").center().color("red").hidden().print()
        ,
        
        newButton("continue", "다음 문장으로 넘어갑니다")
          .print()
          .center()
          .wait( getScale("acceptability").test.selected().failure(getText("warning").visible()) )
          .log()
    )
    // Record trial data
    .log("target_group"     , row.Group)
    .log("target_set"     , row.Set)
    .log("target_condition", row.Condition)
    .log("target_sentence"   , row.Sentence)
    .log("target_word_order" , row.word_order)
    .log("target_interpretation" , row.interpretation)
    .log("target_existential", row.exi_type)
)

// Filler
Template("filler.csv", row =>
    newTrial( "filler" ,
        newText("질문: 첫번째 문장에 이어지는 문장으로 두번째 문장은 얼마나 자연스럽습니까?")
            .color("Blue")
            .center()
            .print()
            ,
        newText("sentence", row.Sentence)
            .cssContainer({"margin-top":"2em", "margin-bottom":"2em"})
            .center()
            .print()
            ,
    // 7-point scale
        newScale("acceptability", "1","2","3","4","5","6","7")
            .before( newText("left", "<div class='fancy'>(매우 부자연스러움)</div>") )
            .after( newText("right", "<div class='fancy'>(매우 자연스러움)</div>") )
            .labelsPosition("top")
            //.callback(getText("warning").hidden() )
            .center()
            .log()
            .print()
            ,
        // Wait briefly to display which option was selected
            newTimer("wait", 300)
            .start()
            .wait()
        ,
        
        newText("warning", "문장에 대한 평가를 해주십시오.").center().color("red").hidden().print()
        ,
        
        newButton("continue", "다음 문장으로 넘어갑니다")
          .print()
          .center()
          .wait( getScale("acceptability").test.selected().failure(getText("warning").visible()) )
          .log()
    )
    // Record filler data
    .log("filler_number"     , row.Number)
    .log("filler_sentence"     , row.Sentence)
    .log("filler_felicitous", row.Felicitous)
)

// Final screen
newTrial("end",
    newText("이것으로 실험은 종료되었습니다. 소중한 시간 내주셔서 감사합니다!")
        .center()
        .print()
    ,
    // This link a placeholder: replace it with a URL provided by your participant-pooling platform
   // newText("<p><a href='https://www.pcibex.net/' target='_blank'>Click here to validate your submission</a></p>")
    //    .center()
    //   .print()
    //,
    // Trick: stay on this trial forever (until tab is closed)
    newButton().wait()
)
.setOption("countsForProgressBar",false);